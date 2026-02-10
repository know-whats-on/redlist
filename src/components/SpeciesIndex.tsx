import React, { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, Search as SearchIcon, X, Copy, Check, Database, RefreshCw } from 'lucide-react';
import { taxonomyDb, TaxonRecord } from '../lib/taxonomyDb';
import { taxonomyPackSync, PackInfo, SyncProgress } from '../lib/taxonomyPackSync';
import { taxonomySearch, SearchResult } from '../lib/taxonomySearch';

// Define explicit pack structure
interface PackCard {
  packId: string;
  name: string;
  description: string;
}

interface PhylumGroup {
  phylum: string;
  displayName: string;
  packs: PackCard[];
}

const PHYLUM_GROUPS: PhylumGroup[] = [
  {
    phylum: 'Arthropoda',
    displayName: 'Arthropoda',
    packs: [
      { packId: 'auto_animalia_arthropoda_insecta', name: 'Insecta', description: 'Insects: beetles, butterflies, flies, ants, and more.' },
      { packId: 'auto_animalia_arthropoda_arachnida', name: 'Arachnida', description: 'Spiders, scorpions, mites, and ticks.' },
      { packId: 'auto_animalia_arthropoda_malacostraca', name: 'Malacostraca', description: 'Crabs, lobsters, shrimps, and many crustaceans.' },
      { packId: 'auto_animalia_arthropoda_ostracoda', name: 'Ostracoda', description: 'Seed shrimp and related micro-crustaceans.' },
      { packId: 'auto_animalia_arthropoda_other', name: 'Other Arthropoda', description: 'All remaining arthropod classes not listed above.' }
    ]
  },
  {
    phylum: 'Mollusca',
    displayName: 'Mollusca',
    packs: [
      { packId: 'auto_animalia_mollusca_gastropoda', name: 'Gastropoda', description: 'Snails, slugs, limpets, and related molluscs.' },
      { packId: 'auto_animalia_mollusca_bivalvia', name: 'Bivalvia', description: 'Clams, mussels, oysters, and scallops.' },
      { packId: 'auto_animalia_mollusca_other', name: 'Other Mollusca', description: 'Other mollusc groups not listed above.' }
    ]
  },
  {
    phylum: 'Chordata',
    displayName: 'Chordata',
    packs: [
      { packId: 'auto_animalia_chordata_teleostei', name: 'Teleostei', description: 'Most bony fishes.' },
      { packId: 'auto_animalia_chordata_aves', name: 'Aves', description: 'Birds.' },
      { packId: 'auto_animalia_chordata_other', name: 'Other Chordata', description: 'Other chordate groups not listed above.' }
    ]
  },
  {
    phylum: 'Platyhelminthes',
    displayName: 'Platyhelminthes',
    packs: [
      { packId: 'auto_animalia_platyhelminthes_other', name: 'Other Platyhelminthes', description: 'Flatworms and related groups.' }
    ]
  },
  {
    phylum: 'Cnidaria',
    displayName: 'Cnidaria',
    packs: [
      { packId: 'auto_animalia_cnidaria_other', name: 'Other Cnidaria', description: 'Jellyfish, corals, sea anemones, and relatives.' }
    ]
  },
  {
    phylum: 'Nematoda',
    displayName: 'Nematoda',
    packs: [
      { packId: 'auto_animalia_nematoda_other', name: 'Other Nematoda', description: 'Roundworms.' }
    ]
  },
  {
    phylum: 'Bryozoa',
    displayName: 'Bryozoa',
    packs: [
      { packId: 'auto_animalia_bryozoa_other', name: 'Other Bryozoa', description: 'Moss animals (aquatic colonial invertebrates).' }
    ]
  },
  {
    phylum: 'Annelida',
    displayName: 'Annelida',
    packs: [
      { packId: 'auto_animalia_annelida_other', name: 'Other Annelida', description: 'Segmented worms: earthworms, leeches, and relatives.' }
    ]
  },
  {
    phylum: 'Echinodermata',
    displayName: 'Echinodermata',
    packs: [
      { packId: 'auto_animalia_echinodermata_other', name: 'Other Echinodermata', description: 'Sea stars, sea urchins, sea cucumbers, and relatives.' }
    ]
  },
  {
    phylum: 'Porifera',
    displayName: 'Porifera',
    packs: [
      { packId: 'auto_animalia_porifera_other', name: 'Other Porifera', description: 'Sponges.' }
    ]
  },
  {
    phylum: 'Tracheophyta',
    displayName: 'Tracheophyta (Plants)',
    packs: [
      { packId: 'auto_plantae_tracheophyta_magnoliopsida', name: 'Magnoliopsida', description: 'Flowering plants: many broadleaf plants.' },
      { packId: 'auto_plantae_tracheophyta_liliopsida', name: 'Liliopsida', description: 'Monocots: grasses, orchids, palms, lilies.' },
      { packId: 'auto_plantae_tracheophyta_other', name: 'Other Tracheophyta', description: 'Other vascular plant classes not listed above.' }
    ]
  },
  {
    phylum: 'Bryophyta',
    displayName: 'Bryophyta (Plants)',
    packs: [
      { packId: 'auto_plantae_bryophyta_other', name: 'Other Bryophyta', description: 'Mosses and related non-vascular plants.' }
    ]
  },
  {
    phylum: 'Ascomycota',
    displayName: 'Ascomycota (Fungi)',
    packs: [
      { packId: 'auto_fungi_ascomycota_dothideomycetes', name: 'Dothideomycetes', description: 'Large fungal class with many plant-associated fungi.' },
      { packId: 'auto_fungi_ascomycota_sordariomycetes', name: 'Sordariomycetes', description: 'Fungal class including many molds and endophytes.' },
      { packId: 'auto_fungi_ascomycota_other', name: 'Other Ascomycota', description: 'Other ascomycete classes not listed above.' }
    ]
  },
  {
    phylum: 'Basidiomycota',
    displayName: 'Basidiomycota (Fungi)',
    packs: [
      { packId: 'auto_fungi_basidiomycota_agaricomycetes', name: 'Agaricomycetes', description: 'Mushrooms, bracket fungi, puffballs, and relatives.' },
      { packId: 'auto_fungi_basidiomycota_other', name: 'Other Basidiomycota', description: 'Other basidiomycete classes not listed above.' }
    ]
  }
];

export function SpeciesIndex() {
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);
  const [packSizes, setPackSizes] = useState<Map<string, number>>(new Map());
  const [packSizesError, setPackSizesError] = useState(false);
  const [syncingPackId, setSyncingPackId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ taxonCount: 0, synonymCount: 0, isComplete: false });
  const [showManageStorage, setShowManageStorage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPacksForSearch, setSelectedPacksForSearch] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<TaxonRecord | null>(null);
  const [selectedSynonymName, setSelectedSynonymName] = useState<string | undefined>(undefined);
  const [showSpeciesDetail, setShowSpeciesDetail] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showTimeoutToast, setShowTimeoutToast] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [indexList, setIndexList] = useState<TaxonRecord[]>([]);
  const [indexLoading, setIndexLoading] = useState(false);

  useEffect(() => {
    loadInstalledPacks();
    loadPackSizes();
    loadIndexList();
  }, []);

  useEffect(() => {
    // Default search scope: all installed packs
    setSelectedPacksForSearch(installedPacks);
  }, [installedPacks]);

  const loadInstalledPacks = async () => {
    const packs = await taxonomyDb.getInstalledPacks();
    setInstalledPacks(packs);
  };

  const loadPackSizes = async () => {
    try {
      const packs = await taxonomyPackSync.listPacks();
      const sizeMap = new Map<string, number>();
      packs.forEach(pack => {
        sizeMap.set(pack.pack_id, pack.taxa_count);
      });
      setPackSizes(sizeMap);
      setPackSizesError(false);
    } catch (error: any) {
      console.error('Failed to load pack sizes:', error);
      // Don't show error banner for timeout - just work without counts
      if (!error.message?.includes('statement timeout')) {
        setPackSizesError(true);
      }
      // UI will work fine without pack sizes, cards just won't show counts
    }
  };

  const loadIndexList = async () => {
    setIndexLoading(true);
    try {
      const packs = await taxonomyDb.getInstalledPacks();
      
      if (packs.length === 0) {
        setIndexList([]);
        return;
      }

      // Get first 30 taxa from all packs, sorted by scientific_name
      const taxa = await taxonomyDb.taxon
        .orderBy('scientific_name')
        .limit(30)
        .toArray();

      setIndexList(taxa);
    } catch (error) {
      console.error('Index list error:', error);
      setIndexList([]);
    } finally {
      setIndexLoading(false);
    }
  };

  const handleDownloadPack = async (packId: string, packName: string, phylum: string) => {
    setSyncingPackId(packId);
    setSyncProgress({ taxonCount: 0, synonymCount: 0, isComplete: false });
    setShowTimeoutToast(false);
    setDownloadError(null);

    try {
      await taxonomyPackSync.downloadPack(packId, (progress) => {
        if (progress.error === 'TIMEOUT_RETRY') {
          if (!showTimeoutToast) {
            setShowTimeoutToast(true);
            setTimeout(() => setShowTimeoutToast(false), 4000);
          }
        }
        setSyncProgress(progress);
      });

      await loadInstalledPacks();
      showToastMessage(`${packName} downloaded`);
    } catch (error: any) {
      console.error('Download error:', error);
      setDownloadError(error.message);
    } finally {
      setSyncingPackId(null);
    }
  };

  const handleRemovePack = async (packId: string, packName: string) => {
    try {
      await taxonomyPackSync.removePack(packId);
      await loadInstalledPacks();
      showToastMessage(`${packName} removed`);
    } catch (error) {
      console.error('Remove error:', error);
      showToastMessage('Failed to remove pack');
    }
  };

  const handleSearch = useCallback(
    async (query: string, packIds: string[]) => {
      if (installedPacks.length === 0 || query.length < 2 || packIds.length === 0) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await taxonomySearch.search(query, packIds, 20);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    },
    [installedPacks]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery, selectedPacksForSearch);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedPacksForSearch, handleSearch]);

  const handleSelectSpecies = (result: SearchResult) => {
    setSelectedSpecies(result.taxon);
    setSelectedSynonymName(result.synonymName);
    setShowSpeciesDetail(true);
  };

  const handleUseInAssessment = () => {
    if (!selectedSpecies) return;

    // Store the selected taxon data
    const selectedTaxon = {
      id: selectedSpecies.id,
      scientificName: selectedSpecies.scientific_name,
      rank: selectedSpecies.rank,
      kingdom: selectedSpecies.kingdom,
      family: selectedSpecies.family,
      genus: selectedSpecies.genus,
      authorship: selectedSpecies.authorship,
      packId: selectedSpecies.pack_id,
      selectedAt: new Date().toISOString()
    };

    localStorage.setItem('selectedTaxonForAssessment', JSON.stringify(selectedTaxon));
    
    // Close the species detail sheet
    setShowSpeciesDetail(false);
    
    // Show toast
    showToastMessage('Opening New Assessment...');
    
    // Wait a moment then trigger the New Assessment modal
    setTimeout(() => {
      const event = new CustomEvent('openNewAssessment');
      window.dispatchEvent(event);
    }, 300);
  };

  const handleCopyName = async () => {
    if (selectedSpecies) {
      try {
        // Try modern Clipboard API first
        await navigator.clipboard.writeText(selectedSpecies.scientific_name);
        showToastMessage('Name copied');
      } catch (err) {
        // Fallback for browsers/contexts where Clipboard API is blocked
        try {
          // Create temporary textarea for fallback copy
          const textarea = document.createElement('textarea');
          textarea.value = selectedSpecies.scientific_name;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showToastMessage('Name copied');
        } catch (fallbackErr) {
          // If both methods fail, just show the error
          showToastMessage('Copy failed - please copy manually');
          console.error('Copy failed:', err, fallbackErr);
        }
      }
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const togglePackInSearch = (packId: string) => {
    if (selectedPacksForSearch.includes(packId)) {
      setSelectedPacksForSearch(selectedPacksForSearch.filter(p => p !== packId));
    } else {
      setSelectedPacksForSearch([...selectedPacksForSearch, packId]);
    }
  };

  const getStatusPillText = () => {
    if (syncingPackId) return 'Syncing';
    if (installedPacks.length > 0) return 'Ready';
    return 'Not downloaded';
  };

  const getStatusPillColor = () => {
    if (syncingPackId) return '#60A5FA';
    if (installedPacks.length > 0) return '#6EE7B7';
    return '#8E91A3';
  };

  const getPackLabel = (packId: string): string => {
    for (const group of PHYLUM_GROUPS) {
      const pack = group.packs.find(p => p.packId === packId);
      if (pack) return pack.name;
    }
    return packId;
  };

  const getCurrentSyncingPackInfo = () => {
    if (!syncingPackId) return null;
    
    for (const group of PHYLUM_GROUPS) {
      const pack = group.packs.find(p => p.packId === syncingPackId);
      if (pack) {
        return { name: pack.name, phylum: group.displayName };
      }
    }
    return null;
  };

  return (
    <div className="space-y-4" style={{ paddingBottom: '140px' }}>
      {/* Header with status pill */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
            Species Index
          </h2>
          <p className="text-sm" style={{ color: '#C9CBD6' }}>
            Catalogue of Life on this device
          </p>
        </div>
        <span
          className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
          style={{ 
            background: `${getStatusPillColor()}20`,
            color: getStatusPillColor()
          }}
        >
          {getStatusPillText()}
        </span>
      </div>

      {/* Installed summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#C9CBD6' }}>
          Installed packs: <strong style={{ color: '#FFFFFF' }}>{installedPacks.length}</strong>
        </p>
        {installedPacks.length > 0 && (
          <button
            onClick={() => setShowManageStorage(true)}
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: '#D2110C' }}
          >
            <Database className="w-4 h-4" />
            Manage storage
          </button>
        )}
      </div>

      {/* Progress card (pinned during sync) */}
      {syncingPackId && getCurrentSyncingPackInfo() && (
        <div
          className="rounded-[18px] card-shadow p-4"
          style={{ background: '#14151A', border: '1px solid #242632' }}
        >
          <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
            Downloading pack
          </h3>
          <p className="text-sm mb-3" style={{ color: '#C9CBD6' }}>
            {getCurrentSyncingPackInfo()!.name} under {getCurrentSyncingPackInfo()!.phylum}
          </p>
          <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: '#1A1C22' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: '100%',
                background: '#D2110C',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#C9CBD6' }}>
              Taxa downloaded: <strong style={{ color: '#FFFFFF' }}>{syncProgress.taxonCount.toLocaleString()}</strong>
            </span>
            <span style={{ color: '#C9CBD6' }}>
              Synonyms downloaded: <strong style={{ color: '#FFFFFF' }}>{syncProgress.synonymCount.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Pack sizes error banner */}
      {packSizesError && (
        <div
          className="rounded-lg p-3"
          style={{ background: 'rgba(210, 17, 12, 0.15)', border: '1px solid rgba(210, 17, 12, 0.3)' }}
        >
          <p className="text-sm" style={{ color: '#D2110C' }}>
            Could not load pack sizes.
          </p>
        </div>
      )}

      {/* Download error banner */}
      {downloadError && !syncingPackId && (
        <div
          className="rounded-lg p-3 flex items-start justify-between gap-3"
          style={{ background: 'rgba(210, 17, 12, 0.15)', border: '1px solid rgba(210, 17, 12, 0.3)' }}
        >
          <p className="text-sm flex-1" style={{ color: '#D2110C' }}>
            Download failed: {downloadError}
          </p>
          <button
            onClick={() => setDownloadError(null)}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" style={{ color: '#D2110C' }} />
          </button>
        </div>
      )}

      {/* Search section (only if packs installed) */}
      {installedPacks.length > 0 && (
        <>
          <div className="relative">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: '#8E91A3' }}
            />
            <input
              type="text"
              placeholder="Search species"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl"
              style={{
                background: '#14151A',
                border: '1px solid #242632',
                color: '#FFFFFF'
              }}
            />
          </div>

          {/* Scope chips */}
          {searchQuery.length >= 2 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {installedPacks.map((packId) => (
                <button
                  key={packId}
                  onClick={() => togglePackInSearch(packId)}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: selectedPacksForSearch.includes(packId) ? '#D2110C' : '#1A1C22',
                    color: selectedPacksForSearch.includes(packId) ? '#FFFFFF' : '#C9CBD6',
                    border: `1px solid ${selectedPacksForSearch.includes(packId) ? '#D2110C' : '#242632'}`
                  }}
                >
                  {getPackLabel(packId)}
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {searchQuery.length >= 2 && selectedPacksForSearch.length > 0 && (
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={`${result.taxon.id}-${index}`}
                    onClick={() => handleSelectSpecies(result)}
                    className="w-full rounded-[18px] card-shadow p-4 text-left transition-all active:scale-98"
                    style={{ background: '#14151A', border: '1px solid #242632' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#FFFFFF' }}>
                          {result.matchType === 'synonym' && result.synonymName
                            ? result.synonymName
                            : result.taxon.scientific_name}
                        </p>
                        <p className="text-sm truncate" style={{ color: '#C9CBD6' }}>
                          {result.taxon.rank} • {result.taxon.kingdom || 'Unknown'}
                          {result.taxon.authorship && ` • ${result.taxon.authorship}`}
                        </p>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                        style={{
                          background: result.matchType === 'accepted' ? 'rgba(110, 231, 183, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                          color: result.matchType === 'accepted' ? '#6EE7B7' : '#60A5FA'
                        }}
                      >
                        {result.matchType === 'accepted' ? 'Accepted' : 'Synonym'}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    No results found
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Packs section */}
      <div className="space-y-6 mt-6">
        {PHYLUM_GROUPS.map((group) => (
          <div key={group.phylum}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#FFFFFF' }}>
              {group.displayName}
            </h3>
            <div className="space-y-3">
              {group.packs.map((pack) => (
                <PackCard
                  key={pack.packId}
                  packId={pack.packId}
                  name={pack.name}
                  description={pack.description}
                  taxaCount={packSizes.get(pack.packId)}
                  isInstalled={installedPacks.includes(pack.packId)}
                  isSyncing={syncingPackId === pack.packId}
                  isAnySyncing={!!syncingPackId}
                  phylum={group.displayName}
                  onDownload={() => handleDownloadPack(pack.packId, pack.name, group.displayName)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Manage Storage Modal */}
      {showManageStorage && (
        <ManageStorageModal
          installedPacks={installedPacks}
          getPackLabel={getPackLabel}
          onRemove={handleRemovePack}
          onClose={() => setShowManageStorage(false)}
        />
      )}

      {/* Species Detail Bottom Sheet */}
      {showSpeciesDetail && selectedSpecies && (
        <SpeciesDetailSheet
          species={selectedSpecies}
          synonymName={selectedSynonymName}
          onClose={() => setShowSpeciesDetail(false)}
          onUseInAssessment={handleUseInAssessment}
          onCopyName={handleCopyName}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-2xl animate-slide-up flex items-center gap-2"
          style={{ background: '#1A1C22', border: '1px solid #242632' }}
        >
          <Check className="w-4 h-4" style={{ color: '#6EE7B7' }} />
          <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            {toastMessage}
          </p>
        </div>
      )}

      {/* Timeout Toast */}
      {showTimeoutToast && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-2xl animate-slide-down"
          style={{ background: '#1A1C22', border: '1px solid #60A5FA' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#60A5FA' }}>
            Network slow — switching to smaller chunks
          </p>
        </div>
      )}
    </div>
  );
}

interface PackCardProps {
  packId: string;
  name: string;
  description: string;
  taxaCount?: number;
  isInstalled: boolean;
  isSyncing: boolean;
  isAnySyncing: boolean;
  phylum: string;
  onDownload: () => void;
}

function PackCard({ packId, name, description, taxaCount, isInstalled, isSyncing, isAnySyncing, phylum, onDownload }: PackCardProps) {
  const getButtonText = () => {
    if (isSyncing) return 'Downloading…';
    if (isInstalled) return 'Update';
    return 'Download';
  };

  return (
    <div
      className="rounded-[18px] card-shadow p-4"
      style={{ 
        background: '#14151A', 
        border: isInstalled ? '1px solid #34D399' : '1px solid #242632',
        borderLeft: isInstalled ? '3px solid #34D399' : '1px solid #242632'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold" style={{ color: '#FFFFFF' }}>
              {name}
            </h4>
            {isInstalled && (
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}
              >
                Installed
              </span>
            )}
          </div>
          <p className="text-sm mb-2" style={{ color: '#C9CBD6' }}>
            {description}
          </p>
          {taxaCount !== undefined && (
            <p className="text-xs" style={{ color: '#8E91A3' }}>
              Taxa in pack: {taxaCount.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onDownload}
        disabled={isSyncing || (isAnySyncing && !isSyncing)}
        className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
        style={{
          opacity: (isSyncing || (isAnySyncing && !isSyncing)) ? 0.5 : 1,
          cursor: (isSyncing || (isAnySyncing && !isSyncing)) ? 'not-allowed' : 'pointer'
        }}
      >
        {isSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {getButtonText()}
      </button>
    </div>
  );
}

interface ManageStorageModalProps {
  installedPacks: string[];
  getPackLabel: (packId: string) => string;
  onRemove: (packId: string, packName: string) => void;
  onClose: () => void;
}

function ManageStorageModal({ installedPacks, getPackLabel, onRemove, onClose }: ManageStorageModalProps) {
  const [removingPackId, setRemovingPackId] = useState<string | null>(null);

  const handleRemove = async (packId: string) => {
    setRemovingPackId(packId);
    await onRemove(packId, getPackLabel(packId));
    setRemovingPackId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="rounded-[22px] card-shadow-raised max-w-md w-full max-h-[80vh] flex flex-col animate-slide-up"
        style={{ background: '#1A1C22' }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: '#242632' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              Manage Storage
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: '#14151A' }}
            >
              <X className="w-5 h-5" style={{ color: '#C9CBD6' }} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {installedPacks.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8E91A3' }}>
              No packs installed
            </p>
          ) : (
            <div className="space-y-3">
              {installedPacks.map((packId) => (
                <div
                  key={packId}
                  className="rounded-xl p-4 flex items-center justify-between gap-3"
                  style={{ background: '#14151A', border: '1px solid #242632' }}
                >
                  <p className="font-semibold flex-1" style={{ color: '#FFFFFF' }}>
                    {getPackLabel(packId)}
                  </p>
                  <button
                    onClick={() => handleRemove(packId)}
                    disabled={removingPackId === packId}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: 'transparent',
                      border: '1px solid #D2110C',
                      color: '#D2110C',
                      opacity: removingPackId === packId ? 0.5 : 1
                    }}
                  >
                    {removingPackId === packId ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t" style={{ borderColor: '#242632' }}>
          <button onClick={onClose} className="w-full btn-secondary py-3">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface SpeciesDetailSheetProps {
  species: TaxonRecord;
  synonymName?: string;
  onClose: () => void;
  onUseInAssessment: () => void;
  onCopyName: () => void;
}

function SpeciesDetailSheet({ species, synonymName, onClose, onUseInAssessment, onCopyName }: SpeciesDetailSheetProps) {
  const lineageParts = [
    species.kingdom && `Kingdom → ${species.kingdom}`,
    species.phylum && `Phylum → ${species.phylum}`,
    species.class && `Class → ${species.class}`,
    species.order && `Order → ${species.order}`,
    species.family && `Family → ${species.family}`,
    species.genus && `Genus → ${species.genus}`
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto rounded-t-[22px] card-shadow-raised animate-slide-up"
        style={{ background: '#1A1C22', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: '#242632' }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                {species.scientific_name}
              </h2>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {species.authorship ? `${species.authorship} • ` : ''}{species.rank}
              </p>
              {synonymName && (
                <p className="text-sm mt-1" style={{ color: '#60A5FA' }}>
                  Synonym: {synonymName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              style={{ background: '#14151A' }}
            >
              <X className="w-5 h-5" style={{ color: '#C9CBD6' }} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {species.kingdom && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(110, 231, 183, 0.15)', color: '#6EE7B7' }}
              >
                {species.kingdom}
              </span>
            )}
            {species.phylum && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}
              >
                {species.phylum}
              </span>
            )}
            {species.class && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}
              >
                {species.class}
              </span>
            )}
            {species.order && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' }}
              >
                {species.order}
              </span>
            )}
            {species.family && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#F87171' }}
              >
                {species.family}
              </span>
            )}
            {species.genus && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF' }}
              >
                {species.genus}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 220px)' }}>
          {lineageParts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                Lineage
              </h3>
              <div className="space-y-1">
                {lineageParts.map((part, index) => (
                  <p key={index} className="text-sm" style={{ color: '#FFFFFF' }}>
                    {part}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t space-y-3" style={{ borderColor: '#242632' }}>
          <button onClick={onUseInAssessment} className="w-full btn-primary py-3">
            Use in assessment
          </button>
          <button
            onClick={onCopyName}
            className="w-full py-3 rounded-xl font-semibold transition-all"
            style={{ background: 'transparent', border: '1px solid #242632', color: '#C9CBD6' }}
          >
            <Copy className="w-4 h-4 inline mr-2" />
            Copy name
          </button>
          <p className="text-xs text-center pt-2" style={{ color: '#8E91A3' }}>
            Taxonomy source: Catalogue of Life. IUCN SIS taxonomy may differ.
          </p>
        </div>
      </div>
    </div>
  );
}