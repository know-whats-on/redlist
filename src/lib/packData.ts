// Exact pack data with taxa counts from Catalogue of Life

export interface PackCard {
  packId: string;
  name: string;
  description: string;
  taxaCount: number;
}

export interface PhylumGroup {
  phylum: string;
  displayName: string;
  packs: PackCard[];
}

export const PHYLUM_GROUPS: PhylumGroup[] = [
  {
    phylum: 'Arthropoda',
    displayName: 'Arthropoda',
    packs: [
      { 
        packId: 'arthropoda_insecta', 
        name: 'Insecta', 
        description: 'Insects: beetles, butterflies, flies, ants, and more.',
        taxaCount: 535249
      },
      { 
        packId: 'arthropoda_arachnida', 
        name: 'Arachnida', 
        description: 'Spiders, scorpions, mites, and ticks.',
        taxaCount: 53987
      },
      { 
        packId: 'arthropoda_malacostraca', 
        name: 'Malacostraca', 
        description: 'Crabs, lobsters, shrimps, and many crustaceans.',
        taxaCount: 27408
      },
      { 
        packId: 'arthropoda_ostracoda', 
        name: 'Ostracoda', 
        description: 'Seed shrimp and related micro-crustaceans.',
        taxaCount: 10918
      },
      { 
        packId: 'arthropoda_other', 
        name: 'Other Arthropoda', 
        description: 'All remaining arthropod classes not listed above.',
        taxaCount: 30207
      }
    ]
  },
  {
    phylum: 'Mollusca',
    displayName: 'Mollusca',
    packs: [
      { 
        packId: 'mollusca_gastropoda', 
        name: 'Gastropoda', 
        description: 'Snails, slugs, limpets, and related molluscs.',
        taxaCount: 62672
      },
      { 
        packId: 'mollusca_bivalvia', 
        name: 'Bivalvia', 
        description: 'Clams, mussels, oysters, and scallops.',
        taxaCount: 15467
      },
      { 
        packId: 'mollusca_other', 
        name: 'Other Mollusca', 
        description: 'Other mollusc groups not listed above.',
        taxaCount: 9476
      }
    ]
  },
  {
    phylum: 'Chordata',
    displayName: 'Chordata',
    packs: [
      { 
        packId: 'chordata_teleostei', 
        name: 'Teleostei', 
        description: 'Most bony fishes.',
        taxaCount: 20315
      },
      { 
        packId: 'chordata_aves', 
        name: 'Aves', 
        description: 'Birds.',
        taxaCount: 16269
      },
      { 
        packId: 'chordata_other', 
        name: 'Other Chordata', 
        description: 'Other chordate groups not listed above.',
        taxaCount: 21968
      }
    ]
  },
  {
    phylum: 'Platyhelminthes',
    displayName: 'Platyhelminthes',
    packs: [
      { 
        packId: 'platyhelminthes_other', 
        name: 'Other Platyhelminthes', 
        description: 'Flatworms and related groups.',
        taxaCount: 15790
      }
    ]
  },
  {
    phylum: 'Cnidaria',
    displayName: 'Cnidaria',
    packs: [
      { 
        packId: 'cnidaria_other', 
        name: 'Other Cnidaria', 
        description: 'Jellyfish, corals, sea anemones, and relatives.',
        taxaCount: 11682
      }
    ]
  },
  {
    phylum: 'Nematoda',
    displayName: 'Nematoda',
    packs: [
      { 
        packId: 'nematoda_other', 
        name: 'Other Nematoda', 
        description: 'Roundworms.',
        taxaCount: 11634
      }
    ]
  },
  {
    phylum: 'Bryozoa',
    displayName: 'Bryozoa',
    packs: [
      { 
        packId: 'bryozoa_other', 
        name: 'Other Bryozoa', 
        description: 'Moss animals (aquatic colonial invertebrates).',
        taxaCount: 11538
      }
    ]
  },
  {
    phylum: 'Annelida',
    displayName: 'Annelida',
    packs: [
      { 
        packId: 'annelida_other', 
        name: 'Other Annelida', 
        description: 'Segmented worms: earthworms, leeches, and relatives.',
        taxaCount: 10563
      }
    ]
  },
  {
    phylum: 'Echinodermata',
    displayName: 'Echinodermata',
    packs: [
      { 
        packId: 'echinodermata_other', 
        name: 'Other Echinodermata', 
        description: 'Sea stars, sea urchins, sea cucumbers, and relatives.',
        taxaCount: 7561
      }
    ]
  },
  {
    phylum: 'Porifera',
    displayName: 'Porifera',
    packs: [
      { 
        packId: 'porifera_other', 
        name: 'Other Porifera', 
        description: 'Sponges.',
        taxaCount: 5302
      }
    ]
  },
  {
    phylum: 'Tracheophyta',
    displayName: 'Tracheophyta (Plants)',
    packs: [
      { 
        packId: 'tracheophyta_magnoliopsida', 
        name: 'Magnoliopsida', 
        description: 'Flowering plants: many broadleaf plants.',
        taxaCount: 154950
      },
      { 
        packId: 'tracheophyta_liliopsida', 
        name: 'Liliopsida', 
        description: 'Monocots: grasses, orchids, palms, lilies.',
        taxaCount: 45029
      },
      { 
        packId: 'tracheophyta_other', 
        name: 'Other Tracheophyta', 
        description: 'Other vascular plant classes not listed above.',
        taxaCount: 8412
      }
    ]
  },
  {
    phylum: 'Bryophyta',
    displayName: 'Bryophyta (Plants)',
    packs: [
      { 
        packId: 'bryophyta_other', 
        name: 'Other Bryophyta', 
        description: 'Mosses and related non-vascular plants.',
        taxaCount: 7160
      }
    ]
  },
  {
    phylum: 'Ascomycota',
    displayName: 'Ascomycota (Fungi)',
    packs: [
      { 
        packId: 'ascomycota_dothideomycetes', 
        name: 'Dothideomycetes', 
        description: 'Large fungal class with many plant-associated fungi.',
        taxaCount: 16863
      },
      { 
        packId: 'ascomycota_sordariomycetes', 
        name: 'Sordariomycetes', 
        description: 'Fungal class including many molds and endophytes.',
        taxaCount: 13550
      },
      { 
        packId: 'ascomycota_other', 
        name: 'Other Ascomycota', 
        description: 'Other ascomycete classes not listed above.',
        taxaCount: 22441
      }
    ]
  },
  {
    phylum: 'Basidiomycota',
    displayName: 'Basidiomycota (Fungi)',
    packs: [
      { 
        packId: 'basidiomycota_agaricomycetes', 
        name: 'Agaricomycetes', 
        description: 'Mushrooms, bracket fungi, puffballs, and relatives.',
        taxaCount: 20807
      },
      { 
        packId: 'basidiomycota_other', 
        name: 'Other Basidiomycota', 
        description: 'Other basidiomycete classes not listed above.',
        taxaCount: 6386
      }
    ]
  }
];

// Helper function to get pack by ID
export function getPackById(packId: string): { pack: PackCard; phylum: string } | null {
  for (const group of PHYLUM_GROUPS) {
    const pack = group.packs.find(p => p.packId === packId);
    if (pack) {
      return { pack, phylum: group.displayName };
    }
  }
  return null;
}

// Helper function to get pack label
export function getPackLabel(packId: string): string {
  const result = getPackById(packId);
  return result?.pack.name || packId;
}

// Search packs by name, description, or phylum
export function searchPacks(query: string): PhylumGroup[] {
  if (!query || query.length < 2) return PHYLUM_GROUPS;
  
  const lowerQuery = query.toLowerCase();
  const filtered: PhylumGroup[] = [];
  
  for (const group of PHYLUM_GROUPS) {
    const phylumMatches = group.displayName.toLowerCase().includes(lowerQuery);
    const matchingPacks = group.packs.filter(pack => 
      pack.name.toLowerCase().includes(lowerQuery) ||
      pack.description.toLowerCase().includes(lowerQuery)
    );
    
    if (phylumMatches || matchingPacks.length > 0) {
      filtered.push({
        ...group,
        packs: phylumMatches ? group.packs : matchingPacks
      });
    }
  }
  
  return filtered;
}
