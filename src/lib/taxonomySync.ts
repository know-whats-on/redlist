import { supabase } from './supabaseClient';
import { taxonomyDb, TaxonRecord, SynonymRecord } from './taxonomyDb';

export interface SyncProgress {
  taxonCount: number;
  synonymCount: number;
  isComplete: boolean;
  error?: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export class TaxonomySync {
  private isSyncing = false;
  private abortController: AbortController | null = null;

  async syncTaxonChunks(
    onProgress: SyncProgressCallback,
    lim: number = 25000
  ): Promise<void> {
    let lastId = (await taxonomyDb.getMeta('taxon_last_id') as string) || '';
    let totalRows = (await taxonomyDb.getMeta('taxon_rows') as number) || 0;

    while (true) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Sync aborted');
      }

      // Call Supabase RPC function
      const { data, error } = await supabase.rpc('export_taxon_chunk', {
        last_id: lastId,
        lim: lim
      });

      if (error) {
        throw new Error(`Taxon sync failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        break; // Done
      }

      // Convert to TaxonRecord format
      const records: TaxonRecord[] = data.map((row: any) => ({
        id: row.id,
        parent_id: row.parent_id,
        rank: row.rank,
        scientific_name: row.scientific_name,
        authorship: row.authorship,
        status: row.status,
        kingdom: row.kingdom,
        phylum: row.phylum,
        class: row.class,
        order: row.order,
        family: row.family,
        genus: row.genus
      }));

      // Bulk insert into IndexedDB
      await taxonomyDb.taxon.bulkPut(records);

      // Update meta
      lastId = records[records.length - 1].id;
      totalRows += records.length;

      await taxonomyDb.transaction('rw', taxonomyDb.meta, async () => {
        await taxonomyDb.setMeta('taxon_last_id', lastId);
        await taxonomyDb.setMeta('taxon_rows', totalRows);
      });

      // Report progress
      const synonymCount = (await taxonomyDb.getMeta('syn_rows') as number) || 0;
      onProgress({
        taxonCount: totalRows,
        synonymCount: synonymCount,
        isComplete: false
      });
    }

    // Mark as synced
    await taxonomyDb.setMeta('taxon_synced_at', new Date().toISOString());
  }

  async syncSynonymChunks(
    onProgress: SyncProgressCallback,
    lim: number = 25000
  ): Promise<void> {
    let lastPk = (await taxonomyDb.getMeta('syn_last_pk') as number) || 0;
    let totalRows = (await taxonomyDb.getMeta('syn_rows') as number) || 0;

    while (true) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Sync aborted');
      }

      // Call Supabase RPC function
      const { data, error } = await supabase.rpc('export_synonym_chunk', {
        last_pk: lastPk,
        lim: lim
      });

      if (error) {
        throw new Error(`Synonym sync failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        break; // Done
      }

      // Convert to SynonymRecord format
      const records: SynonymRecord[] = data.map((row: any) => ({
        pk: row.id || row.pk,
        accepted_id: row.accepted_id,
        synonym_name: row.synonym_name,
        authorship: row.authorship,
        status: row.status,
        rank: row.rank
      }));

      // Bulk insert into IndexedDB
      await taxonomyDb.synonym.bulkPut(records);

      // Update meta
      lastPk = records[records.length - 1].pk;
      totalRows += records.length;

      await taxonomyDb.transaction('rw', taxonomyDb.meta, async () => {
        await taxonomyDb.setMeta('syn_last_pk', lastPk);
        await taxonomyDb.setMeta('syn_rows', totalRows);
      });

      // Report progress
      const taxonCount = (await taxonomyDb.getMeta('taxon_rows') as number) || 0;
      onProgress({
        taxonCount: taxonCount,
        synonymCount: totalRows,
        isComplete: false
      });
    }

    // Mark as synced
    await taxonomyDb.setMeta('syn_synced_at', new Date().toISOString());
  }

  async startSync(onProgress: SyncProgressCallback): Promise<void> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    this.abortController = new AbortController();

    try {
      // Sync taxa first
      await this.syncTaxonChunks(onProgress);

      // Then sync synonyms
      await this.syncSynonymChunks(onProgress);

      // Final progress update
      const taxonCount = (await taxonomyDb.getMeta('taxon_rows') as number) || 0;
      const synonymCount = (await taxonomyDb.getMeta('syn_rows') as number) || 0;

      onProgress({
        taxonCount,
        synonymCount,
        isComplete: true
      });
    } finally {
      this.isSyncing = false;
      this.abortController = null;
    }
  }

  abort(): void {
    this.abortController?.abort();
  }

  isInProgress(): boolean {
    return this.isSyncing;
  }
}

export const taxonomySync = new TaxonomySync();
