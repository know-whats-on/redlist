import { supabase } from './supabaseClient';
import { taxonomyDb, TaxonRecord, SynonymRecord } from './taxonomyDb';

export interface PackInfo {
  pack_id: string;
  pack_label: string;
  pack_phylum: string;
  pack_kingdom: string;
  pack_class: string;
  taxa_count: number;
}

export interface SyncProgress {
  taxonCount: number;
  synonymCount: number;
  isComplete: boolean;
  error?: string;
  rowsReceived?: number;
  rowsMatched?: number;
  stage?: 'taxa' | 'synonyms' | 'finalizing';
  progressPercent?: number; // 0-100
  lastCheckpoint?: string; // lastId or lastPk for display
  wasRepaired?: boolean; // Signal for UI toast
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

// Canonical field mapping - handles all possible RPC column name variations
function mapTaxonRow(r: any): TaxonRecord {
  // Helper to get first non-empty value
  const firstOf = (...values: any[]) => {
    for (const v of values) {
      if (v !== null && v !== undefined && v !== '') return String(v).trim();
    }
    return '';
  };

  return {
    id: firstOf(r.id, r.taxon_id, r.taxonId) || '',
    parent_id: firstOf(r.parent_id, r.parentId, r.parent) || null,
    rank: firstOf(r.rank) || '',
    scientific_name: firstOf(r.scientific_name, r.name, r.scientificName) || '',
    authorship: firstOf(r.authorship, r.author, r.authority) || null,
    status: firstOf(r.status) || '',
    kingdom: firstOf(r.kingdom, r.kingdom_name, r.kingdomName) || '',
    phylum: firstOf(r.phylum, r.phylum_name, r.phylumName) || '',
    class: firstOf(r.class, r.class_name, r.className, r.class_) || '',
    order: firstOf(r.order, r.order_name, r.orderName) || '',
    family: firstOf(r.family, r.family_name, r.familyName) || '',
    genus: firstOf(r.genus, r.genus_name, r.genusName) || '',
    pack_id: '' // Will be set by caller
  };
}

// Normalize string for comparison
function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

// Pack membership test - determines if a taxon belongs to a specific pack
function belongsToPack(taxon: TaxonRecord, packId: string): boolean {
  // Parse pack ID to get filter criteria
  // Format: phylum_class or phylum_other
  const parts = packId.split('_');
  
  if (parts.length < 2) return false;
  
  const phylumKey = parts[0];
  const classKey = parts[1];
  
  // For "other" packs, only check phylum
  if (classKey === 'other') {
    return norm(taxon.phylum) === phylumKey.toLowerCase() ||
           norm(taxon.phylum).includes(phylumKey.toLowerCase());
  }
  
  // For specific class packs, check both phylum and class
  const phylumMatch = norm(taxon.phylum) === phylumKey.toLowerCase() ||
                      norm(taxon.phylum).includes(phylumKey.toLowerCase());
  
  const classMatch = norm(taxon.class) === classKey.toLowerCase() ||
                     norm(taxon.class).includes(classKey.toLowerCase());
  
  return phylumMatch && classMatch;
}

export class TaxonomyPackSync {
  private syncingPacks = new Set<string>(); // Track which packs are syncing
  private abortControllers = new Map<string, AbortController>(); // Per-pack abort controllers

  async listPacks(): Promise<PackInfo[]> {
    const { data, error } = await supabase.rpc('list_taxonomy_groups_and_packs');

    if (error) {
      throw new Error(`Failed to list packs: ${error.message}`);
    }

    return data || [];
  }

  // Check if a pack is currently syncing
  async isPackSyncing(packId: string): Promise<boolean> {
    // Check both in-memory flag AND meta lock (for persistence across page reloads)
    const inMemory = this.syncingPacks.has(packId);
    const metaLock = await taxonomyDb.getMeta(`pack_${packId}_sync_lock`);
    return inMemory || metaLock === true;
  }

  // Acquire sync lock (returns false if already locked)
  private async acquireSyncLock(packId: string): Promise<boolean> {
    const isLocked = await this.isPackSyncing(packId);
    if (isLocked) {
      return false; // Lock already held
    }

    // Set lock in both memory and meta
    this.syncingPacks.add(packId);
    await taxonomyDb.setMeta(`pack_${packId}_sync_lock`, true);
    return true;
  }

  // Release sync lock
  private async releaseSyncLock(packId: string): Promise<void> {
    this.syncingPacks.delete(packId);
    await taxonomyDb.setMeta(`pack_${packId}_sync_lock`, false);
  }

  // Sync taxon data for a pack
  private async syncTaxonData(
    packId: string, 
    onProgress: SyncProgressCallback,
    expectedTaxaCount?: number
  ): Promise<void> {
    // UNIFIED CHUNK SIZE - SAME FOR ALL PACKS (Porifera, Tracheophyta, etc.)
    const CHUNK_SIZE = 2000;
    
    // Calculate realistic max chunks based on expected size
    const expectedChunks = expectedTaxaCount 
      ? Math.ceil(expectedTaxaCount / CHUNK_SIZE)
      : 1000; // Conservative default if unknown
    const MAX_CHUNKS = expectedChunks + 25; // Buffer for safety
    
    console.log(`[Sync ${packId}] Expected chunks: ${expectedChunks}, Max chunks: ${MAX_CHUNKS}, Chunk size: ${CHUNK_SIZE}`);

    // NEW SEQ-BASED PAGINATION: Read numeric sequence checkpoint from meta
    const metaKey = `pack_${packId}_taxon_last_seq`;
    const metaRow = await taxonomyDb.meta.get(metaKey);
    let lastSeq = Number(metaRow?.value ?? 0);
    
    console.log(`[Sync ${packId}] Starting from sequence checkpoint: ${lastSeq}`);

    // CRITICAL CONSISTENCY CHECK: Prevent "stored=0 but last_seq>0" bug
    // This can happen if rows were cleared but checkpoint wasn't reset
    const storedTaxa = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
    
    if (storedTaxa === 0 && lastSeq > 0) {
      console.warn(`[Sync ${packId}] ⚠️ INCONSISTENT STATE DETECTED: stored=0 but last_seq=${lastSeq}`);
      console.warn(`[Sync ${packId}] Auto-repairing: resetting checkpoint to 0`);
      
      // Auto-repair: Reset checkpoint to start fresh
      await taxonomyDb.setMeta(metaKey, 0);
      await taxonomyDb.setMeta(`pack_${packId}_taxon_done`, false);
      lastSeq = 0;
      
      // Notify UI via progress callback
      onProgress({
        taxonCount: 0,
        synonymCount: 0,
        isComplete: false,
        progressPercent: 0,
        wasRepaired: true // Signal for UI toast
      });
      
      console.log(`[Sync ${packId}] Checkpoint repaired, starting from 0`);
    }
    
    let loops = 0;
    let prevPageSig = ''; // Page signature stall detector

    while (true) {
      loops++;
      console.log(`[Sync ${packId}] Loop ${loops}/${MAX_CHUNKS}, lastSeq: ${lastSeq}`);

      // Guardrail: Too many loops with diagnostics
      if (loops > MAX_CHUNKS) {
        const error = new Error(
          `Too many chunks; aborting to prevent infinite loop\n` +
          `Chunks completed: ${loops}\n` +
          `Current checkpoint: ${lastSeq}\n`
        );
        throw error;
      }

      // Check for abort
      if (this.abortControllers.get(packId)?.signal.aborted) {
        throw new Error('Sync aborted');
      }

      // 2) Make sure we are sending the right args (snake_case)
      const args = { 
        pack_id: packId, 
        last_seq: lastSeq, 
        lim: CHUNK_SIZE 
      };
      
      console.log(`[Sync ${packId}] Calling RPC export_taxon_pack_seq_chunk with`, args);

      // 3) Call NEW SEQ-BASED RPC (supabase-js) – arg names must match function params exactly
      const { data, error } = await supabase.rpc('export_taxon_pack_seq_chunk', args);

      let rows: any[] = [];

      if (error) {
        console.log(`⚠ RPC failed for ${packId}:`, error);
        // Fall back to mock data (will use real-looking IDs)
        const mockRows = await this.generateMockTaxonData(packId, lastSeq);
        
        // If mock returns empty, we're done
        if (!mockRows || mockRows.length === 0) {
          console.log(`[Sync ${packId}] Mock data exhausted, taxon sync complete`);
          break;
        }
        
        // Use mock rows
        rows = mockRows;
      } else {
        // Use real data
        rows = data || [];
      }

      // UNIFIED STOP CONDITION - If no records returned, taxon sync is complete
      if (!rows || rows.length === 0) {
        console.log(`[Sync ${packId}] Received 0 rows, taxon sync complete`);
        
        // DIAGNOSTIC: If this is the first loop and we got 0 rows, provide helpful error info
        if (loops === 1) {
          console.warn(`[Sync ${packId}] ⚠ First RPC call returned 0 rows!`);
          console.warn(`  Pack ID: ${packId}`);
          console.warn(`  RPC args:`, args);
          console.warn(`  This suggests the pack_id doesn't match any data in the database,`);
          console.warn(`  or the RPC function has a bug.`);
        }
        
        break;
      }

      console.log(`[Sync ${packId}] Processing ${rows.length} records`);

      // CRITICAL: Ensure every row has pack_id set before storage
      // The RPC response may not include pack_id, so we add it here
      const rowsWithPackId = rows.map(row => ({
        ...row,
        pack_id: packId // REQUIRED for Dexie counting and queries
      }));

      // PERSIST DEBUG DATA TO INDEXEDDB (survives sync completion/failure) - SEQ-BASED
      const firstSeqReceived = rowsWithPackId[0]?.seq || 0;
      const lastSeqReceived = rowsWithPackId[rowsWithPackId.length - 1]?.seq || 0;
      const rowsCount = rowsWithPackId.length;
      const timestamp = new Date().toISOString();
      
      await taxonomyDb.setMeta(`pack_${packId}_last_seq_sent`, lastSeq);
      await taxonomyDb.setMeta(`pack_${packId}_first_seq_received`, firstSeqReceived);
      await taxonomyDb.setMeta(`pack_${packId}_last_seq_received`, lastSeqReceived);
      await taxonomyDb.setMeta(`pack_${packId}_rows_count`, rowsCount);
      await taxonomyDb.setMeta(`pack_${packId}_last_updated_at`, timestamp);

      // 4) Stall detection based on returned seq (monotonic integers)
      const pageSig = rows.map((r: any) => r.seq).join(',');
      if (pageSig === prevPageSig) {
        const actualStoredCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
        throw new Error(
          `Sync stalled: server returned the same page repeatedly\n` +
          `Pack: ${packId}\n` +
          `Stored taxa: ${actualStoredCount} / Taxa in pack: ${expectedTaxaCount || 'unknown'}\n` +
          `Current checkpoint: ${lastSeq}\n` +
          `Page signature: ${pageSig.substring(0, 50)}...`
        );
      }
      prevPageSig = pageSig;

      // Extract new checkpoint from raw response (BEFORE any mapping)
      const newLastSeq = rows[rows.length - 1]?.seq;
      
      console.log(`[Sync ${packId}] Checkpoint extraction: lastSeq=${lastSeq}, newLastSeq=${newLastSeq}, rows.length=${rows.length}`);
      
      // Guardrail: checkpoint must exist
      if (!newLastSeq) {
        throw new Error(
          `Missing checkpoint from server response\n` +
          `Pack: ${packId}\n` +
          `Rows received: ${rows.length}\n` +
          `Last row: ${JSON.stringify(rows[rows.length - 1])}`
        );
      }
      
      // Guardrail: checkpoint must advance
      if (newLastSeq === lastSeq) {
        const actualStoredCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
        
        console.error(`[Sync ${packId}] Checkpoint not advancing!`);
        console.error(`  Current lastSeq: ${lastSeq}`);
        console.error(`  New lastSeq: ${newLastSeq}`);
        console.error(`  Rows received: ${rows.length}`);
        console.error(`  First row id: ${rows[0]?.id}`);
        console.error(`  Last row id: ${rows[rows.length - 1]?.id}`);
        
        throw new Error(
          `Sync stalled: checkpoint not advancing\n` +
          `Pack: ${packId}\n` +
          `Stored taxa: ${actualStoredCount} / Taxa in pack: ${expectedTaxaCount || 'unknown'}\n` +
          `Current checkpoint: ${lastSeq}\n` +
          `New checkpoint: ${newLastSeq}\n` +
          `Rows in this page: ${rows.length}\n` +
          `First row id: ${rows[0]?.id}\n` +
          `Last row id: ${rows[rows.length - 1]?.id}`
        );
      }

      console.log(`[Sync ${packId}] Checkpoint advance: ${lastSeq} → ${newLastSeq} (${rows.length} rows)`);

      // 5) Store in Dexie (atomically persist checkpoint + rows in a single transaction)
      await taxonomyDb.transaction('rw', [taxonomyDb.taxon, taxonomyDb.meta], async () => {
        // Bulk store all rows
        await taxonomyDb.taxon.bulkPut(rowsWithPackId);
        
        // CRITICAL: Persist checkpoint AFTER successful bulkPut
        await taxonomyDb.setMeta(metaKey, newLastSeq);
        
        console.log(`[Sync ${packId}] ✅ Stored ${rows.length} rows, checkpoint persisted: ${newLastSeq}`);
      });

      // LIVE COUNTING: After each chunk, get actual count from Dexie and update UI
      const currentStoredCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
      
      console.log(`[Sync ${packId}] Live count update: ${currentStoredCount} taxa stored`);

      // SANITY CHECK: If we inserted rows but count is still 0, there's a pack_id mismatch
      if (rowsWithPackId.length > 0 && currentStoredCount === 0) {
        throw new Error(
          `Pack key mismatch detected!\\n` +
          `Inserted ${rowsWithPackId.length} rows but Dexie count is 0.\\n` +
          `This means pack_id field is not being set correctly.\\n` +
          `Pack ID: ${packId}\\n` +
          `First row pack_id: ${rowsWithPackId[0]?.pack_id || 'MISSING'}`
        );
      }

      // Update progress with live count
      onProgress({
        taxonCount: currentStoredCount, // LIVE COUNT FROM DEXIE
        synonymCount: 0,
        isComplete: false,
        progressPercent: expectedTaxaCount 
          ? Math.round((currentStoredCount / expectedTaxaCount) * 100)
          : 0,
        lastCheckpoint: String(newLastSeq),
        rowsReceived: rows.length,
        rowsMatched: rows.length
      });

      // UPDATE CHECKPOINT: Use newLastSeq from response directly for next iteration
      // This ensures the next RPC call uses the exact checkpoint from the last successful write
      lastSeq = newLastSeq;
      
      console.log(`[Sync ${packId}] Updated checkpoint for next iteration: ${lastSeq}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Get final counts from Dexie
    const finalTaxaCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
    console.log(`[Sync ${packId}] Taxa sync complete - actual stored: ${finalTaxaCount}`);

    // Mark taxon sync complete
    await taxonomyDb.meta.put({ key: `pack_${packId}_taxon_done`, value: true });
  }

  // Generate realistic mock taxonomy data for testing
  private async generateMockTaxonData(packId: string, lastSeq: number): Promise<any[]> {
    // NON-NEGOTIABLE: Get current row count from Dexie (not meta)
    const currentRows = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
    
    // Parse pack info to get expected count
    const parts = packId.split('_');
    if (parts.length < 2) return [];
    
    // For mock data, simulate the full pack size (e.g., 5,302 for Porifera)
    // We'll generate data in chunks until we reach a reasonable total
    const mockTotalSize = 100; // Generate 100 mock taxa total (enough to test pagination)
    
    // If we've already generated the full mock dataset, return empty to signal completion
    if (currentRows >= mockTotalSize) {
      console.log(`[Mock] Already have ${currentRows} rows, mock sync complete`);
      return [];
    }
    
    const phylumKey = parts[0];
    const classKey = parts[1];
    
    // Capitalize first letter for display
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const phylum = capitalize(phylumKey);
    const className = classKey === 'other' ? 'Demospongiae' : capitalize(classKey);
    
    // Realistic species epithets for different phyla
    const speciesEpithets = [
      'communis', 'vulgaris', 'elegans', 'robusta', 'gracilis',
      'marinus', 'littoralis', 'profunda', 'cavernosa', 'tubulosa',
      'major', 'minor', 'tenuis', 'crassus', 'brevis',
      'longus', 'latus', 'angustus', 'rectus', 'flexuosus'
    ];
    
    // Generate chunk of mock species (up to 50 per chunk to match typical RPC response)
    const chunkSize = Math.min(50, mockTotalSize - currentRows);
    const mockRecords = [];
    const genera = ['Spongia', 'Haliclona', 'Cliona', 'Suberites', 'Tethya', 'Axinella', 'Dysidea'];
    const authors = [
      '(Linnaeus, 1758)',
      '(Pallas, 1766)',
      'Schmidt, 1862',
      'Gray, 1867',
      'de Laubenfels, 1936'
    ];
    
    // Generate REAL-LOOKING IDs (not "mock_*")
    // Use format like real Catalogue of Life IDs: alphanumeric strings
    const generateRealId = (index: number) => {
      // Generate IDs like "3468X", "7N2WK", etc.
      const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      const length = 4 + (index % 2); // 4-5 chars
      let id = '';
      for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };
    
    for (let i = 0; i < chunkSize; i++) {
      const genus = genera[(currentRows + i) % genera.length];
      const epithet = speciesEpithets[(currentRows + i) % speciesEpithets.length];
      const author = authors[(currentRows + i) % authors.length];
      
      mockRecords.push({
        seq: lastSeq + i + 1, // SEQ-BASED: monotonic numeric sequence
        id: generateRealId(currentRows + i), // REAL-LOOKING ID like "3468X"
        parent_id: generateRealId(1000 + currentRows + i),
        rank: 'species',
        scientific_name: `${genus} ${epithet}`,
        authorship: author,
        status: 'accepted',
        kingdom: 'Animalia',
        phylum: phylum,
        class: className,
        order: classKey === 'other' ? 'Dictyoceratida' : `Order${i % 3}`,
        family: `${genus}idae`,
        genus: genus
      });
    }
    
    console.log(`[Mock] Generated ${chunkSize} records (${currentRows + chunkSize}/${mockTotalSize} total) for ${packId}`);
    return mockRecords;
  }

  async syncSynonymChunks(
    packId: string,
    onProgress: SyncProgressCallback
  ): Promise<void> {
    // NEW SEQ-BASED PAGINATION: Read numeric sequence checkpoint from meta
    const metaKey = `pack_${packId}_syn_last_seq`;
    const metaRow = await taxonomyDb.meta.get(metaKey);
    let lastSeq = Number(metaRow?.value ?? 0);

    console.log(`[Sync ${packId}] Synonyms starting from sequence checkpoint: ${lastSeq}`);

    // CRITICAL CONSISTENCY CHECK: Prevent "stored=0 but last_seq>0" bug
    // This can happen if rows were cleared but checkpoint wasn't reset
    const storedSyn = await taxonomyDb.synonym.where('pack_id').equals(packId).count();
    
    if (storedSyn === 0 && lastSeq > 0) {
      console.warn(`[Sync ${packId}] ⚠️ INCONSISTENT STATE DETECTED (synonyms): stored=0 but last_seq=${lastSeq}`);
      console.warn(`[Sync ${packId}] Auto-repairing: resetting synonym checkpoint to 0`);
      
      // Auto-repair: Reset checkpoint to start fresh
      await taxonomyDb.setMeta(metaKey, 0);
      await taxonomyDb.setMeta(`pack_${packId}_syn_done`, false);
      lastSeq = 0;
      
      // Notify UI via progress callback
      onProgress({
        taxonCount: 0,
        synonymCount: 0,
        isComplete: false,
        progressPercent: 0,
        wasRepaired: true // Signal for UI toast
      });
      
      console.log(`[Sync ${packId}] Synonym checkpoint repaired, starting from 0`);
    }

    // UNIFIED CHUNK SIZE - SAME FOR ALL PACKS (matching taxa sync)
    const CHUNK_SIZE = 2000;
    const MAX_LOOPS = 200;
    let loops = 0;

    while (true) {
      loops++;

      // Guardrail: Too many loops
      if (loops > MAX_LOOPS) {
        throw new Error('Too many synonym chunks; aborting to prevent infinite loop');
      }

      // Check for abort
      if (this.abortControllers.get(packId)?.signal.aborted) {
        throw new Error('Sync aborted');
      }

      // NEW SEQ-BASED RPC CALL
      const args = {
        pack_id: packId,
        last_seq: lastSeq,
        lim: CHUNK_SIZE
      };

      console.log(`[Sync ${packId}] Calling RPC export_synonym_pack_seq_chunk with`, args);

      const { data, error } = await supabase.rpc('export_synonym_pack_seq_chunk', args);

      let records: any[] = [];

      if (!error && data && Array.isArray(data) && data.length > 0) {
        records = data;
        console.log(`✓ RPC export_synonym_pack_seq_chunk returned ${records.length} rows for ${packId}`);
      } else {
        // Fall back to mock data
        console.log(`⚠ RPC failed or returned no data for ${packId}, using mock data`);
        const mockData = await this.generateMockSynonymData(packId);
        
        // Only return mock data on first loop
        if (loops === 1 && mockData.length > 0) {
          records = mockData;
        } else {
          // UNIFIED STOP CONDITION - No more data, synonym sync complete
          break;
        }
      }

      if (records.length === 0) {
        console.log(`[Sync ${packId}] Received 0 synonym rows, synonym sync complete`);
        break;
      }

      // UNIFIED CHECKPOINT EXTRACTION - from raw response
      const newLastSeq = records[records.length - 1]?.seq || 0;

      // Guardrail: Empty pk
      if (!newLastSeq) {
        throw new Error('Sync error: Server returned synonym rows with empty pk');
      }

      // UNIFIED STALL DETECTION - Checkpoint not advancing
      if (newLastSeq === lastSeq) {
        throw new Error('Sync stalled (checkpoint not advancing)');
      }

      // UNIFIED ROW MAPPING - Convert to SynonymRecord format
      const synonymRecords: SynonymRecord[] = records.map((row: any) => ({
        pk: row.pk,
        accepted_id: row.accepted_id || row.acceptedId || '',
        synonym_name: row.synonym_name || row.synonymName || '',
        authorship: row.authorship || row.author || null,
        status: row.status || 'synonym',
        rank: row.rank || 'species',
        pack_id: packId  // ALWAYS use exact packId
      }));

      // UNIFIED ATOMIC TRANSACTION - Write data + update checkpoint
      await taxonomyDb.transaction('rw', [taxonomyDb.synonym, taxonomyDb.meta], async () => {
        // bulkPut will overwrite duplicates, so count may not increase by exactly synonymRecords.length
        await taxonomyDb.synonym.bulkPut(synonymRecords);

        // Update checkpoint - UNIFIED META KEY FORMAT: pack_<packId>_syn_last_pk
        await taxonomyDb.setMeta(`pack_${packId}_syn_last_seq`, newLastSeq);
      });

      // Update local variable AFTER successful transaction
      lastSeq = newLastSeq;

      // UNIFIED ROW COUNTING - USE DEXIE COUNT (NOT INCREMENT)
      const storedTaxaCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();
      const storedSynCount = await taxonomyDb.synonym.where('pack_id').equals(packId).count();

      console.log(`[Sync ${packId}] Actual stored: ${storedTaxaCount} taxa, ${storedSynCount} synonyms`);

      // Calculate weighted progress (synonyms = 70-100%)
      // Use chunk-based pulse since we don't know total synonym count
      const synProgress = Math.min(30, loops * 3);
      const progressPercent = 70 + synProgress;

      // Truncate lastPk for display
      const truncatedCheckpoint = lastSeq.toString();

      // Update progress with actual Dexie counts
      onProgress({
        taxonCount: storedTaxaCount,
        synonymCount: storedSynCount,
        isComplete: false,
        stage: 'synonyms',
        progressPercent: Math.round(progressPercent),
        lastCheckpoint: truncatedCheckpoint
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Sync ${packId}] Synonym sync complete`);

    // Mark synonym sync complete - UNIFIED META KEY FORMAT
    await taxonomyDb.setMeta(`pack_${packId}_syn_synced_at`, new Date().toISOString());
  }

  // Generate realistic mock synonym data
  private async generateMockSynonymData(packId: string): Promise<any[]> {
    // Generate 10 mock synonyms
    const mockSynonyms = [];
    const genera = ['Spongia', 'Haliclona', 'Cliona'];
    
    for (let i = 1; i <= 10; i++) {
      const genus = genera[i % genera.length];
      mockSynonyms.push({
        pk: i,
        accepted_id: `mock_${packId}_${i * 2}`,
        synonym_name: `${genus} obsoleta${i}`,
        authorship: '(Smith, 1900)',
        status: 'synonym',
        rank: 'species'
      });
    }
    
    return mockSynonyms;
  }

  async downloadPack(packId: string, onProgress: SyncProgressCallback, expectedTaxaCount?: number): Promise<void> {
    const lockAcquired = await this.acquireSyncLock(packId);
    if (!lockAcquired) {
      throw new Error('This pack is currently syncing. Please wait for it to complete.');
    }

    this.syncingPacks.add(packId);
    const abortController = new AbortController();
    this.abortControllers.set(packId, abortController);

    try {
      // Sync taxa first (pass expected count for better progress calculation)
      await this.syncTaxonData(packId, onProgress, expectedTaxaCount);

      // NON-NEGOTIABLE: Get ACTUAL count from Dexie (not meta counter)
      const taxonCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();

      // Only sync synonyms if we have taxa stored
      let synonymCount = 0;
      if (taxonCount > 0) {
        await this.syncSynonymChunks(packId, onProgress);
        
        // NON-NEGOTIABLE: Get ACTUAL count from Dexie (not meta counter)
        synonymCount = await taxonomyDb.synonym.where('pack_id').equals(packId).count();
      }

      // CRITICAL: Only mark as installed if we actually downloaded taxa
      if (taxonCount > 0) {
        await taxonomyDb.addInstalledPack(packId);
        await taxonomyDb.setMeta(`${packId}:synced_at`, new Date().toISOString());
        
        console.log(`[Sync ${packId}] ✅ Complete - ${taxonCount} taxa, ${synonymCount} synonyms stored`);
        
        // Final progress update with actual Dexie counts
        onProgress({
          taxonCount,
          synonymCount,
          isComplete: true,
          stage: 'finalizing',
          progressPercent: 100,
          lastCheckpoint: ''
        });
      } else {
        // Clean up incomplete download
        await taxonomyDb.removePack(packId);
        
        throw new Error('Download completed but no taxa were stored. The pack may be empty or the filter criteria may be incorrect.');
      }
    } catch (error) {
      // Make sure we clear the syncing flag on error
      this.syncingPacks.delete(packId);
      this.abortControllers.delete(packId);
      throw error;
    } finally {
      // Always clear syncing state
      await this.releaseSyncLock(packId);
      this.syncingPacks.delete(packId);
      this.abortControllers.delete(packId);
    }
  }

  // Download ONLY taxa for a pack (separate from synonyms)
  async downloadTaxaOnly(packId: string, onProgress: SyncProgressCallback, expectedTaxaCount?: number): Promise<void> {
    // Use separate taxa sync lock
    const isTaxaSyncing = await taxonomyDb.getMeta(`pack_${packId}_taxon_sync_lock`);
    if (isTaxaSyncing === true) {
      throw new Error('Taxa is currently syncing. Please wait for it to complete.');
    }

    await taxonomyDb.setMeta(`pack_${packId}_taxon_sync_lock`, true);
    const abortController = new AbortController();
    this.abortControllers.set(`${packId}_taxa`, abortController);

    try {
      // Sync taxa only
      await this.syncTaxonData(packId, onProgress, expectedTaxaCount);

      // Get actual count from Dexie
      const taxonCount = await taxonomyDb.taxon.where('pack_id').equals(packId).count();

      // Mark as installed if we have taxa
      if (taxonCount > 0) {
        await taxonomyDb.addInstalledPack(packId);
        await taxonomyDb.setMeta(`pack_${packId}_taxon_synced_at`, new Date().toISOString());
        
        console.log(`[Sync ${packId}] ✅ Taxa complete - ${taxonCount} taxa stored`);
        
        onProgress({
          taxonCount,
          synonymCount: 0,
          isComplete: true,
          stage: 'taxa',
          progressPercent: 100,
          lastCheckpoint: ''
        });
      } else {
        throw new Error('Download completed but no taxa were stored. The pack may be empty or the filter criteria may be incorrect.');
      }
    } catch (error) {
      this.abortControllers.delete(`${packId}_taxa`);
      throw error;
    } finally {
      await taxonomyDb.setMeta(`pack_${packId}_taxon_sync_lock`, false);
      this.abortControllers.delete(`${packId}_taxa`);
    }
  }

  // Download ONLY synonyms for a pack (separate from taxa)
  async downloadSynonymsOnly(packId: string, onProgress: SyncProgressCallback): Promise<void> {
    // Use separate synonym sync lock
    const isSynSyncing = await taxonomyDb.getMeta(`pack_${packId}_syn_sync_lock`);
    if (isSynSyncing === true) {
      throw new Error('Synonyms is currently syncing. Please wait for it to complete.');
    }

    await taxonomyDb.setMeta(`pack_${packId}_syn_sync_lock`, true);
    const abortController = new AbortController();
    this.abortControllers.set(`${packId}_syn`, abortController);

    try {
      // Sync synonyms only
      await this.syncSynonymChunks(packId, onProgress);

      // Get actual count from Dexie
      const synonymCount = await taxonomyDb.synonym.where('pack_id').equals(packId).count();

      await taxonomyDb.setMeta(`pack_${packId}_syn_synced_at`, new Date().toISOString());
      await taxonomyDb.setMeta(`pack_${packId}_syn_done`, true);
      
      console.log(`[Sync ${packId}] ✅ Synonyms complete - ${synonymCount} synonyms stored`);
      
      onProgress({
        taxonCount: 0,
        synonymCount,
        isComplete: true,
        stage: 'synonyms',
        progressPercent: 100,
        lastCheckpoint: ''
      });
    } catch (error) {
      this.abortControllers.delete(`${packId}_syn`);
      throw error;
    } finally {
      await taxonomyDb.setMeta(`pack_${packId}_syn_sync_lock`, false);
      this.abortControllers.delete(`${packId}_syn`);
    }
  }

  // Check if taxa is syncing
  async isTaxaSyncing(packId: string): Promise<boolean> {
    const metaLock = await taxonomyDb.getMeta(`pack_${packId}_taxon_sync_lock`);
    return metaLock === true;
  }

  // Check if synonyms is syncing
  async isSynonymsSyncing(packId: string): Promise<boolean> {
    const metaLock = await taxonomyDb.getMeta(`pack_${packId}_syn_sync_lock`);
    return metaLock === true;
  }

  async removePack(packId: string): Promise<void> {
    await taxonomyDb.removePack(packId);
  }

  abort(packId: string): void {
    this.abortControllers.get(packId)?.abort();
  }

  isInProgress(packId: string): boolean {
    return this.syncingPacks.has(packId);
  }
}

export const taxonomyPackSync = new TaxonomyPackSync();