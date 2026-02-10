import Dexie, { Table } from 'dexie';

// Meta store for sync state and installed packs
export interface MetaEntry {
  key: string;
  value: any; // Can be string, number, array, or object
}

// Taxon table
export interface TaxonRecord {
  id: string;
  parent_id?: string;
  rank: string;
  scientific_name: string;
  authorship?: string;
  status: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  pack_id: string; // Required: which pack this taxon belongs to
}

// Synonym table
export interface SynonymRecord {
  pk: number;
  accepted_id: string;
  synonym_name: string;
  authorship?: string;
  status?: string;
  rank?: string;
  pack_id: string; // Required: which pack this synonym belongs to
}

export class TaxonomyDatabase extends Dexie {
  meta!: Table<MetaEntry, string>;
  taxon!: Table<TaxonRecord, string>;
  synonym!: Table<SynonymRecord, number>;

  constructor() {
    super('col_taxonomy_v1');
    
    // Version 2: Added compound indexes for better pack querying
    this.version(2).stores({
      meta: 'key',
      taxon: 'id, scientific_name, kingdom, phylum, class, pack_id, [pack_id+scientific_name]',
      synonym: 'pk, synonym_name, accepted_id, pack_id, [pack_id+synonym_name]'
    });
    
    // Version 1: Original schema (kept for migration)
    this.version(1).stores({
      meta: 'key',
      taxon: 'id, scientific_name, kingdom, phylum, class, pack_id',
      synonym: 'pk, synonym_name, accepted_id, pack_id'
    });
  }

  async getMeta(key: string): Promise<any> {
    const entry = await this.meta.get(key);
    return entry?.value ?? null;
  }

  async setMeta(key: string, value: any): Promise<void> {
    await this.meta.put({ key, value });
  }

  async getInstalledPacks(): Promise<string[]> {
    const packs = await this.getMeta('installed_packs');
    return packs || [];
  }

  // Get installed packs with their metadata (for UI display)
  async getInstalledPacksWithMeta(): Promise<Array<{ pack_id: string; taxa_count: number; syn_count: number }>> {
    const packIds = await this.getInstalledPacks();
    const results = [];
    
    for (const packId of packIds) {
      const taxaCount = await this.getTaxonCountForPack(packId);
      const synCount = await this.getSynonymCountForPack(packId);
      
      // Only include if it has stored taxa
      if (taxaCount > 0) {
        results.push({
          pack_id: packId,
          taxa_count: taxaCount,
          syn_count: synCount
        });
      }
    }
    
    return results;
  }

  async addInstalledPack(packId: string): Promise<void> {
    const packs = await this.getInstalledPacks();
    if (!packs.includes(packId)) {
      packs.push(packId);
      await this.setMeta('installed_packs', packs);
    }
  }

  async removeInstalledPack(packId: string): Promise<void> {
    const packs = await this.getInstalledPacks();
    const filtered = packs.filter(p => p !== packId);
    await this.setMeta('installed_packs', filtered);
  }

  // Remove all data for a pack
  async removePack(packId: string): Promise<void> {
    await this.transaction('rw', [this.taxon, this.synonym, this.meta], async () => {
      // Delete all taxa for this pack
      await this.taxon.where('pack_id').equals(packId).delete();
      
      // Delete all synonyms for this pack
      await this.synonym.where('pack_id').equals(packId).delete();
      
      // Remove all metadata for this pack
      await this.meta.where('key').startsWith(`${packId}:`).delete();
      
      // Remove from installed packs list
      const installedPacks = (await this.getMeta('installed_packs')) || [];
      const updatedPacks = installedPacks.filter((p: string) => p !== packId);
      await this.setMeta('installed_packs', updatedPacks);
    });
  }

  // Reset pack checkpoint (recovery without clearing entire DB)
  async resetPackCheckpoint(packId: string): Promise<void> {
    await this.transaction('rw', [this.taxon, this.synonym, this.meta], async () => {
      // Delete all taxa for this pack
      await this.taxon.where('pack_id').equals(packId).delete();
      
      // Delete all synonyms for this pack
      await this.synonym.where('pack_id').equals(packId).delete();
      
      // Reset checkpoints to empty/zero (UNIFIED META KEY FORMAT)
      await this.setMeta(`pack_${packId}_taxon_last_id`, '');
      await this.setMeta(`pack_${packId}_taxon_done`, false);
      await this.setMeta(`pack_${packId}_syn_last_pk`, 0);
      await this.setMeta(`pack_${packId}_syn_done`, false);
      await this.setMeta(`pack_${packId}_sync_lock`, false);
      await this.setMeta(`pack_${packId}_taxon_sync_lock`, false);
      await this.setMeta(`pack_${packId}_syn_sync_lock`, false);
      
      // Mark as not installed
      const installedPacks = (await this.getMeta('installed_packs')) || [];
      const updatedPacks = installedPacks.filter((p: string) => p !== packId);
      await this.setMeta('installed_packs', updatedPacks);
      
      // Remove sync timestamps (UNIFIED META KEY FORMAT)
      await this.meta.where('key').equals(`pack_${packId}_taxon_synced_at`).delete();
      await this.meta.where('key').equals(`pack_${packId}_syn_synced_at`).delete();
      await this.meta.where('key').equals(`${packId}:synced_at`).delete();
    });
  }

  // Reset ONLY taxa for a pack (leave synonyms intact)
  async resetPackTaxa(packId: string): Promise<void> {
    await this.transaction('rw', [this.taxon, this.meta], async () => {
      // Delete all taxa for this pack
      await this.taxon.where('pack_id').equals(packId).delete();
      
      // Reset taxa checkpoints only - SEQ-BASED
      await this.setMeta(`pack_${packId}_taxon_last_seq`, 0);
      await this.setMeta(`pack_${packId}_taxon_done`, false);
      await this.setMeta(`pack_${packId}_taxon_sync_lock`, false);
      
      // Remove taxa sync timestamp
      await this.meta.where('key').equals(`pack_${packId}_taxon_synced_at`).delete();
    });
  }

  // Reset ONLY synonyms for a pack (leave taxa intact)
  async resetPackSynonyms(packId: string): Promise<void> {
    await this.transaction('rw', [this.synonym, this.meta], async () => {
      // Delete all synonyms for this pack
      await this.synonym.where('pack_id').equals(packId).delete();
      
      // Reset synonym checkpoints only - SEQ-BASED
      await this.setMeta(`pack_${packId}_syn_last_seq`, 0);
      await this.setMeta(`pack_${packId}_syn_done`, false);
      await this.setMeta(`pack_${packId}_syn_sync_lock`, false);
      
      // Remove synonym sync timestamp
      await this.meta.where('key').equals(`pack_${packId}_syn_synced_at`).delete();
    });
  }

  async getTaxonCountForPack(packId: string): Promise<number> {
    return await this.taxon.where('pack_id').equals(packId).count();
  }

  async getSynonymCountForPack(packId: string): Promise<number> {
    return await this.synonym.where('pack_id').equals(packId).count();
  }

  async clearAll(): Promise<void> {
    await this.transaction('rw', this.meta, this.taxon, this.synonym, async () => {
      await this.meta.clear();
      await this.taxon.clear();
      await this.synonym.clear();
    });
  }
}

export const taxonomyDb = new TaxonomyDatabase();