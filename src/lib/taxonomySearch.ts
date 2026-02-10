import { taxonomyDb, TaxonRecord } from './taxonomyDb';

export interface SearchResult {
  taxon: TaxonRecord;
  matchType: 'accepted' | 'synonym';
  synonymName?: string;
}

export class TaxonomySearch {
  async search(
    query: string,
    packIds: string[],
    limit: number = 20
  ): Promise<SearchResult[]> {
    if (query.length < 2 || packIds.length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];
    const seenIds = new Set<string>();

    // 1. Search accepted taxa by scientific name (prefix match) across specified packs
    const acceptedMatches = await taxonomyDb.taxon
      .where('scientific_name')
      .startsWithIgnoreCase(normalizedQuery)
      .filter(taxon => packIds.includes(taxon.pack_id))
      .limit(limit)
      .toArray();

    for (const taxon of acceptedMatches) {
      results.push({
        taxon,
        matchType: 'accepted'
      });
      seenIds.add(taxon.id);
    }

    // 2. If we have room, search synonyms
    if (results.length < limit) {
      const synonymMatches = await taxonomyDb.synonym
        .where('synonym_name')
        .startsWithIgnoreCase(normalizedQuery)
        .filter(synonym => packIds.includes(synonym.pack_id))
        .limit(limit - results.length + 10)
        .toArray();

      // Resolve synonyms to accepted taxa
      const acceptedIds = [...new Set(synonymMatches.map(s => s.accepted_id))];
      const acceptedTaxa = await taxonomyDb.taxon.bulkGet(acceptedIds);

      for (let i = 0; i < synonymMatches.length && results.length < limit; i++) {
        const synonym = synonymMatches[i];
        const taxon = acceptedTaxa.find(t => t?.id === synonym.accepted_id);

        if (taxon && !seenIds.has(taxon.id)) {
          results.push({
            taxon,
            matchType: 'synonym',
            synonymName: synonym.synonym_name
          });
          seenIds.add(taxon.id);
        }
      }
    }

    return results.slice(0, limit);
  }
}

export const taxonomySearch = new TaxonomySearch();
