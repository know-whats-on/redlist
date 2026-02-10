import { supabase } from './supabaseClient';

export interface TaxonomyPack {
  id: string; // pack_id
  kingdom: string;
  phylum: string;
  class: string | null;
  label: string;
  description: string;
  sort_order: number;
  min_taxa: number;
  taxa_count?: number; // from taxonomy_pack_counts
}

/**
 * Fetch all taxonomy packs from Supabase with counts
 */
export async function fetchTaxonomyPacks(): Promise<TaxonomyPack[]> {
  try {
    // Fetch packs with counts in a single query using a join
    const { data, error } = await supabase
      .from('taxonomy_packs')
      .select(`
        id,
        kingdom,
        phylum,
        class,
        label,
        description,
        sort_order,
        min_taxa,
        taxonomy_pack_counts!inner (
          taxa_count
        )
      `)
      .order('phylum', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch taxonomy packs:', error);
      
      // Return mock data for development
      return getMockTaxonomyPacks();
    }

    // Transform the data to flatten the counts
    // PostgREST returns taxonomy_pack_counts as an OBJECT (not array)
    const packs: TaxonomyPack[] = (data || []).map((row: any) => {
      // Correct mapping: row.taxonomy_pack_counts.taxa_count
      const taxaCount = row.taxonomy_pack_counts?.taxa_count ?? null;
      
      return {
        id: row.id,
        kingdom: row.kingdom,
        phylum: row.phylum,
        class: row.class,
        label: row.label,
        description: row.description,
        sort_order: row.sort_order,
        min_taxa: row.min_taxa,
        taxa_count: taxaCount
      };
    });

    return packs;
  } catch (error) {
    console.error('Exception fetching taxonomy packs:', error);
    return getMockTaxonomyPacks();
  }
}

/**
 * Mock taxonomy packs for development (matches the spec exactly)
 */
function getMockTaxonomyPacks(): TaxonomyPack[] {
  return [
    // Annelida
    { id: 'auto_animalia_annelida_other', kingdom: 'Animalia', phylum: 'Annelida', class: null, label: 'Other Annelida', description: 'Animalia • Annelida • Other classes', sort_order: 1, min_taxa: 3500, taxa_count: 3500 },
    
    // Arthropoda
    { id: 'auto_animalia_arthropoda_insecta', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Insecta', label: 'Insecta', description: 'Animalia • Arthropoda • Insecta', sort_order: 1, min_taxa: 535249, taxa_count: 535249 },
    { id: 'auto_animalia_arthropoda_arachnida', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Arachnida', label: 'Arachnida', description: 'Animalia • Arthropoda • Arachnida', sort_order: 2, min_taxa: 45123, taxa_count: 45123 },
    { id: 'auto_animalia_arthropoda_malacostraca', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Malacostraca', label: 'Malacostraca', description: 'Animalia • Arthropoda • Malacostraca', sort_order: 3, min_taxa: 22000, taxa_count: 22000 },
    { id: 'auto_animalia_arthropoda_ostracoda', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Ostracoda', label: 'Ostracoda', description: 'Animalia • Arthropoda • Ostracoda', sort_order: 4, min_taxa: 8000, taxa_count: 8000 },
    { id: 'auto_animalia_arthropoda_other', kingdom: 'Animalia', phylum: 'Arthropoda', class: null, label: 'Other Arthropoda', description: 'Animalia • Arthropoda • Other classes', sort_order: 5, min_taxa: 15000, taxa_count: 15000 },
    
    // Bryozoa
    { id: 'auto_animalia_bryozoa_other', kingdom: 'Animalia', phylum: 'Bryozoa', class: null, label: 'Other Bryozoa', description: 'Animalia • Bryozoa • Other classes', sort_order: 1, min_taxa: 2100, taxa_count: 2100 },
    
    // Chordata
    { id: 'auto_animalia_chordata_teleostei', kingdom: 'Animalia', phylum: 'Chordata', class: 'Teleostei', label: 'Teleostei', description: 'Animalia • Chordata • Teleostei', sort_order: 1, min_taxa: 28000, taxa_count: 28000 },
    { id: 'auto_animalia_chordata_aves', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', label: 'Aves', description: 'Animalia • Chordata • Aves', sort_order: 2, min_taxa: 10000, taxa_count: 10000 },
    { id: 'auto_animalia_chordata_other', kingdom: 'Animalia', phylum: 'Chordata', class: null, label: 'Other Chordata', description: 'Animalia • Chordata • Other classes', sort_order: 3, min_taxa: 12000, taxa_count: 12000 },
    
    // Cnidaria
    { id: 'auto_animalia_cnidaria_other', kingdom: 'Animalia', phylum: 'Cnidaria', class: null, label: 'Other Cnidaria', description: 'Animalia • Cnidaria • Other classes', sort_order: 1, min_taxa: 9000, taxa_count: 9000 },
    
    // Echinodermata
    { id: 'auto_animalia_echinodermata_other', kingdom: 'Animalia', phylum: 'Echinodermata', class: null, label: 'Other Echinodermata', description: 'Animalia • Echinodermata • Other classes', sort_order: 1, min_taxa: 6500, taxa_count: 6500 },
    
    // Mollusca
    { id: 'auto_animalia_mollusca_gastropoda', kingdom: 'Animalia', phylum: 'Mollusca', class: 'Gastropoda', label: 'Gastropoda', description: 'Animalia • Mollusca • Gastropoda', sort_order: 1, min_taxa: 62000, taxa_count: 62000 },
    { id: 'auto_animalia_mollusca_bivalvia', kingdom: 'Animalia', phylum: 'Mollusca', class: 'Bivalvia', label: 'Bivalvia', description: 'Animalia • Mollusca • Bivalvia', sort_order: 2, min_taxa: 9200, taxa_count: 9200 },
    { id: 'auto_animalia_mollusca_other', kingdom: 'Animalia', phylum: 'Mollusca', class: null, label: 'Other Mollusca', description: 'Animalia • Mollusca • Other classes', sort_order: 3, min_taxa: 8000, taxa_count: 8000 },
    
    // Nematoda
    { id: 'auto_animalia_nematoda_other', kingdom: 'Animalia', phylum: 'Nematoda', class: null, label: 'Other Nematoda', description: 'Animalia • Nematoda • Other classes', sort_order: 1, min_taxa: 15000, taxa_count: 15000 },
    
    // Platyhelminthes
    { id: 'auto_animalia_platyhelminthes_other', kingdom: 'Animalia', phylum: 'Platyhelminthes', class: null, label: 'Other Platyhelminthes', description: 'Animalia • Platyhelminthes • Other classes', sort_order: 1, min_taxa: 8000, taxa_count: 8000 },
    
    // Porifera
    { id: 'auto_animalia_porifera_other', kingdom: 'Animalia', phylum: 'Porifera', class: null, label: 'Other Porifera', description: 'Animalia • Porifera • Other classes', sort_order: 1, min_taxa: 5302, taxa_count: 5302 },
    
    // Ascomycota
    { id: 'auto_fungi_ascomycota_dothideomycetes', kingdom: 'Fungi', phylum: 'Ascomycota', class: 'Dothideomycetes', label: 'Dothideomycetes', description: 'Fungi • Ascomycota • Dothideomycetes', sort_order: 1, min_taxa: 19000, taxa_count: 19000 },
    { id: 'auto_fungi_ascomycota_sordariomycetes', kingdom: 'Fungi', phylum: 'Ascomycota', class: 'Sordariomycetes', label: 'Sordariomycetes', description: 'Fungi • Ascomycota • Sordariomycetes', sort_order: 2, min_taxa: 10500, taxa_count: 10500 },
    { id: 'auto_fungi_ascomycota_other', kingdom: 'Fungi', phylum: 'Ascomycota', class: null, label: 'Other Ascomycota', description: 'Fungi • Ascomycota • Other classes', sort_order: 3, min_taxa: 25000, taxa_count: 25000 },
    
    // Basidiomycota
    { id: 'auto_fungi_basidiomycota_agaricomycetes', kingdom: 'Fungi', phylum: 'Basidiomycota', class: 'Agaricomycetes', label: 'Agaricomycetes', description: 'Fungi • Basidiomycota • Agaricomycetes', sort_order: 1, min_taxa: 21000, taxa_count: 21000 },
    { id: 'auto_fungi_basidiomycota_other', kingdom: 'Fungi', phylum: 'Basidiomycota', class: null, label: 'Other Basidiomycota', description: 'Fungi • Basidiomycota • Other classes', sort_order: 2, min_taxa: 8000, taxa_count: 8000 },
    
    // Bryophyta
    { id: 'auto_plantae_bryophyta_other', kingdom: 'Plantae', phylum: 'Bryophyta', class: null, label: 'Other Bryophyta', description: 'Plantae • Bryophyta • Other classes', sort_order: 1, min_taxa: 13000, taxa_count: 13000 },
    
    // Tracheophyta
    { id: 'auto_plantae_tracheophyta_magnoliopsida', kingdom: 'Plantae', phylum: 'Tracheophyta', class: 'Magnoliopsida', label: 'Magnoliopsida', description: 'Plantae • Tracheophyta • Magnoliopsida', sort_order: 1, min_taxa: 244000, taxa_count: 244000 },
    { id: 'auto_plantae_tracheophyta_liliopsida', kingdom: 'Plantae', phylum: 'Tracheophyta', class: 'Liliopsida', label: 'Liliopsida', description: 'Plantae • Tracheophyta • Liliopsida', sort_order: 2, min_taxa: 59000, taxa_count: 59000 },
    { id: 'auto_plantae_tracheophyta_other', kingdom: 'Plantae', phylum: 'Tracheophyta', class: null, label: 'Other Tracheophyta', description: 'Plantae • Tracheophyta • Other classes', sort_order: 3, min_taxa: 15000, taxa_count: 15000 },
  ];
}

/**
 * Group packs by phylum
 */
export function groupPacksByPhylum(packs: TaxonomyPack[]): Map<string, TaxonomyPack[]> {
  const grouped = new Map<string, TaxonomyPack[]>();
  
  for (const pack of packs) {
    const existing = grouped.get(pack.phylum) || [];
    existing.push(pack);
    grouped.set(pack.phylum, existing);
  }
  
  // Sort packs within each phylum by sort_order
  for (const [phylum, packList] of grouped.entries()) {
    packList.sort((a, b) => a.sort_order - b.sort_order);
    grouped.set(phylum, packList);
  }
  
  return grouped;
}