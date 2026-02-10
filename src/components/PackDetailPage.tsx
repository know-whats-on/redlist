import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Trash2, Search as SearchIcon, X, Copy, Check, RefreshCw } from 'lucide-react';
import { fetchTaxonomyPacks, TaxonomyPack } from '../lib/taxonomyPackService';
import { taxonomyDb, TaxonRecord } from '../lib/taxonomyDb';
import { taxonomyPackSync, SyncProgress } from '../lib/taxonomyPackSync';
import { taxonomySearch, SearchResult } from '../lib/taxonomySearch';
import { getPhylumBannerImage, getPhylumGradientFallback } from '../lib/phylumBannerImages';

interface PackDetailPageProps {
  packId: string;
  onBack: () => void;
}

export function PackDetailPage({ packId, onBack }: PackDetailPageProps) {
  const [packInfo, setPackInfo] = useState<TaxonomyPack | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [taxonRowCount, setTaxonRowCount] = useState(0);
  const [synonymRowCount, setSynonymRowCount] = useState(0);
  
  // Separate syncing states for taxa and synonyms
  const [isTaxaSyncing, setIsTaxaSyncing] = useState(false);
  const [isSynSyncing, setIsSynSyncing] = useState(false);
  
  // Separate progress states
  const [taxaProgress, setTaxaProgress] = useState<SyncProgress>({ taxonCount: 0, synonymCount: 0, isComplete: false });
  const [synProgress, setSynProgress] = useState<SyncProgress>({ taxonCount: 0, synonymCount: 0, isComplete: false });
  
  // Separate completion states from meta
  const [taxaDone, setTaxaDone] = useState(false);
  const [synDone, setSynDone] = useState(false);
  
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showTimeoutToast, setShowTimeoutToast] = useState(false);
  
  // Index list (first 30 taxa when downloaded)
  const [indexList, setIndexList] = useState<TaxonRecord[]>([]);
  const [indexLoading, setIndexLoading] = useState(false);
  
  // Search within pack
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<TaxonRecord | null>(null);
  const [selectedSynonymName, setSelectedSynonymName] = useState<string | undefined>(undefined);
  const [showSpeciesDetail, setShowSpeciesDetail] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persistent debug state (survives sync completion/failure)
  const [debugLastIdSent, setDebugLastIdSent] = useState<string | null>(null);
  const [debugFirstIdReceived, setDebugFirstIdReceived] = useState<string | null>(null);
  const [debugLastIdReceived, setDebugLastIdReceived] = useState<string | null>(null);
  const [debugRowsCount, setDebugRowsCount] = useState<number | null>(null);
  const [debugLastUpdatedAt, setDebugLastUpdatedAt] = useState<string | null>(null);

  // Completion status
  const isComplete = packInfo && packInfo.taxa_count && taxonRowCount >= packInfo.taxa_count;
  const isIncomplete = isInstalled && !isTaxaSyncing && !isSynSyncing && packInfo && packInfo.taxa_count && taxonRowCount < packInfo.taxa_count;
  const isSyncing = isTaxaSyncing || isSynSyncing; // Legacy compatibility

  // Status for header pill (matches spec)
  const getStatusDisplay = () => {
    if (isSyncing) return { label: 'Syncing', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' };
    if (taxonRowCount === 0) return { label: 'Not downloaded', color: '#8E91A3', bg: 'rgba(142, 145, 163, 0.15)' };
    if (isComplete) return { label: 'Up to date', color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)' };
    return { label: 'Downloaded', color: '#FBB024', bg: 'rgba(251, 176, 36, 0.15)' };
  };

  const statusDisplay = getStatusDisplay();

  useEffect(() => {
    loadPackInfo();
    checkInstallStatus();
    loadDebugData(); // Load persisted debug data on mount
  }, [packId]);

  useEffect(() => {
    loadRowCounts();
  }, [packId, isInstalled]);

  useEffect(() => {
    if (isInstalled && !isSyncing) {
      loadIndexList();
    }
  }, [isInstalled, isSyncing, packId]);

  useEffect(() => {
    if (searchQuery.length >= 2 && isInstalled) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isInstalled]);

  const loadPackInfo = async () => {
    const packs = await fetchTaxonomyPacks();
    const pack = packs.find(p => p.id === packId);
    setPackInfo(pack || null);
  };

  const checkInstallStatus = async () => {
    const installed = await taxonomyDb.getInstalledPacks();
    setIsInstalled(installed.includes(packId));
    
    // Check if taxa or synonyms are currently syncing (separate locks)
    const taxaSyncing = await taxonomyPackSync.isTaxaSyncing(packId);
    const synSyncing = await taxonomyPackSync.isSynonymsSyncing(packId);
    setIsTaxaSyncing(taxaSyncing);
    setIsSynSyncing(synSyncing);
    
    // Load completion states from meta
    const taxaDoneValue = await taxonomyDb.getMeta(`pack_${packId}_taxon_done`);
    const synDoneValue = await taxonomyDb.getMeta(`pack_${packId}_syn_done`);
    setTaxaDone(taxaDoneValue === true);
    setSynDone(synDoneValue === true);
  };

  const loadRowCounts = async () => {
    if (isInstalled) {
      const taxonCount = await taxonomyDb.taxon
        .where('pack_id')
        .equals(packId)
        .count();

      const synonymCount = await taxonomyDb.synonym
        .where('pack_id')
        .equals(packId)
        .count();

      setTaxonRowCount(taxonCount);
      setSynonymRowCount(synonymCount);
    } else {
      setTaxonRowCount(0);
      setSynonymRowCount(0);
    }
  };

  const loadIndexList = async () => {
    setIndexLoading(true);
    try {
      const taxa = await taxonomyDb.taxon
        .where('pack_id')
        .equals(packId)
        .sortBy('scientific_name'); // Sort by scientific_name

      setIndexList(taxa.slice(0, 30)); // Get first 30 after sorting
    } catch (error) {
      console.error('Index list error:', error);
      setIndexList([]);
    } finally {
      setIndexLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      // Simple on-device search within this pack
      const taxa = await taxonomyDb.taxon
        .where('pack_id')
        .equals(packId)
        .and(taxon => 
          taxon.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .limit(20)
        .toArray();

      const results: SearchResult[] = taxa.map(taxon => ({
        taxon,
        matchType: taxon.status === 'accepted' ? 'accepted' : 'synonym'
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleDownload = async () => {
    if (isSyncing) return;

    setIsTaxaSyncing(true); // Set taxa syncing for combined download
    setDownloadError(null);
    setTaxaProgress({ taxonCount: 0, synonymCount: 0, isComplete: false });

    try {
      await taxonomyPackSync.downloadPack(
        packId, 
        (progress) => {
          setTaxaProgress(progress); // Use taxa progress for combined download
        },
        packInfo?.taxa_count // Pass expected count for accurate progress
      );
      
      // Reload status
      await checkInstallStatus();
      await loadRowCounts();
      await loadDebugData(); // Reload debug data to update persistent box
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setDownloadError(errorMessage);
      console.error('Pack download error:', error);
      await loadDebugData(); // Reload debug data even on error to show last RPC call
    } finally {
      setIsTaxaSyncing(false);
    }
  };

  // NEW: Download ONLY taxa
  const handleDownloadTaxa = async () => {
    if (isTaxaSyncing) return;

    setIsTaxaSyncing(true);
    setDownloadError(null);
    setTaxaProgress({ taxonCount: 0, synonymCount: 0, isComplete: false });

    try {
      // If starting fresh (no taxa stored), reset the checkpoint first
      if (taxonRowCount === 0) {
        await taxonomyDb.resetPackTaxa(packId);
      }

      await taxonomyPackSync.downloadTaxaOnly(
        packId,
        (progress) => {
          setTaxaProgress(progress);
          
          // Show toast if checkpoint was auto-repaired
          if (progress.wasRepaired) {
            showToastMessage('Checkpoint repaired');
          }
        },
        packInfo?.taxa_count
      );

      // Reload status
      await checkInstallStatus();
      await loadRowCounts();
      await loadDebugData(); // Reload debug data to update persistent box
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Taxa download failed';
      setDownloadError(errorMessage);
      console.error('Taxa download error:', error);
      await loadDebugData(); // Reload debug data even on error to show last RPC call
    } finally {
      setIsTaxaSyncing(false);
    }
  };

  // NEW: Download ONLY synonyms
  const handleDownloadSynonyms = async () => {
    if (isSynSyncing) return;

    setIsSynSyncing(true);
    setDownloadError(null);
    setSynProgress({ taxonCount: 0, synonymCount: 0, isComplete: false });

    try {
      // If starting fresh (no synonyms stored), reset the checkpoint first
      if (synonymRowCount === 0) {
        await taxonomyDb.resetPackSynonyms(packId);
      }

      await taxonomyPackSync.downloadSynonymsOnly(
        packId,
        (progress) => {
          setSynProgress(progress);
        }
      );

      // Reload status
      await checkInstallStatus();
      await loadRowCounts();
      await loadDebugData(); // Reload debug data to update persistent box
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Synonyms download failed';
      setDownloadError(errorMessage);
      console.error('Synonyms download error:', error);
      await loadDebugData(); // Reload debug data even on error to show last RPC call
    } finally {
      setIsSynSyncing(false);
    }
  };

  // NEW: Reset ONLY taxa
  const handleResetTaxa = async () => {
    try {
      await taxonomyDb.resetPackTaxa(packId);
      await checkInstallStatus();
      await loadRowCounts();
      setDownloadError(null);
      showToastMessage('Taxa reset');
    } catch (error) {
      console.error('Failed to reset taxa:', error);
      showToastMessage('Failed to reset taxa');
    }
  };

  // NEW: Reset ONLY synonyms
  const handleResetSynonyms = async () => {
    try {
      await taxonomyDb.resetPackSynonyms(packId);
      await checkInstallStatus();
      await loadRowCounts();
      setDownloadError(null);
      showToastMessage('Synonyms reset');
    } catch (error) {
      console.error('Failed to reset synonyms:', error);
      showToastMessage('Failed to reset synonyms');
    }
  };

  const handleResetPack = async () => {
    try {
      // Reset the pack completely
      await taxonomyDb.resetPackCheckpoint(packId);
      
      // Reload status
      await checkInstallStatus();
      await loadRowCounts();
      
      setDownloadError(null);
      setShowRemoveConfirm(false);
    } catch (error) {
      console.error('Failed to reset pack:', error);
    }
  };

  const handleRemove = async () => {
    if (!packInfo) return;
    
    try {
      await taxonomyDb.removePack(packId);
      await checkInstallStatus();
      await loadRowCounts();
      setShowRemoveConfirm(false);
      showToastMessage(`${packInfo.label} removed`);
    } catch (error) {
      console.error('Remove error:', error);
      showToastMessage('Failed to remove pack');
    }
  };

  const handleSelectSpecies = (result: SearchResult) => {
    setSelectedSpecies(result.taxon);
    setSelectedSynonymName(result.synonymName);
    setShowSpeciesDetail(true);
  };

  const handleUseInAssessment = () => {
    if (!selectedSpecies) return;

    const selectedTaxon = {
      id: selectedSpecies.id,
      scientificName: selectedSpecies.scientific_name,
      rank: selectedSpecies.rank,
      kingdom: selectedSpecies.kingdom,
      authorship: selectedSpecies.authorship,
      selectedAt: new Date().toISOString()
    };

    localStorage.setItem('selectedTaxonForAssessment', JSON.stringify(selectedTaxon));
    
    // Close the detail sheet first
    setShowSpeciesDetail(false);
    
    // Dispatch event to open New Assessment modal
    setTimeout(() => {
      const event = new CustomEvent('openNewAssessment');
      window.dispatchEvent(event);
    }, 100);
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

  const loadDebugData = async () => {
    const lastSeqSent = await taxonomyDb.getMeta(`pack_${packId}_last_seq_sent`);
    const firstSeqReceived = await taxonomyDb.getMeta(`pack_${packId}_first_seq_received`);
    const lastSeqReceived = await taxonomyDb.getMeta(`pack_${packId}_last_seq_received`);
    const rowsCount = await taxonomyDb.getMeta(`pack_${packId}_rows_count`);
    const lastUpdatedAt = await taxonomyDb.getMeta(`pack_${packId}_last_updated_at`);

    setDebugLastIdSent(lastSeqSent);
    setDebugFirstIdReceived(firstSeqReceived);
    setDebugLastIdReceived(lastSeqReceived);
    setDebugRowsCount(rowsCount);
    setDebugLastUpdatedAt(lastUpdatedAt);
  };

  const clearDebugData = async () => {
    await taxonomyDb.meta.where('key').equals(`pack_${packId}_last_seq_sent`).delete();
    await taxonomyDb.meta.where('key').equals(`pack_${packId}_first_seq_received`).delete();
    await taxonomyDb.meta.where('key').equals(`pack_${packId}_last_seq_received`).delete();
    await taxonomyDb.meta.where('key').equals(`pack_${packId}_rows_count`).delete();
    await taxonomyDb.meta.where('key').equals(`pack_${packId}_last_updated_at`).delete();

    setDebugLastIdSent(null);
    setDebugFirstIdReceived(null);
    setDebugLastIdReceived(null);
    setDebugRowsCount(null);
    setDebugLastUpdatedAt(null);

    showToastMessage('Debug data cleared');
  };

  if (!packInfo) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: '#8E91A3' }}>Pack not found</p>
        <button onClick={onBack} className="btn-secondary mt-4">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ paddingBottom: '140px' }}>
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: '#1A1C22' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#FFFFFF' }} />
        </button>
      </div>

      {/* HERO BANNER */}
      <div className="px-4">
        <div
          className="rounded-[22px] overflow-hidden relative"
          style={{
            background: '#14151A',
            border: '1px solid #242632',
            minHeight: '180px'
          }}
        >
          {/* Banner background image with brightness boost */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getPhylumBannerImage(packInfo.phylum)})`,
              filter: 'brightness(1.15) contrast(1.05) saturate(1.08)'
            }}
          />
          
          {/* Two-layer overlay for readability */}
          <div className="absolute inset-0">
            {/* Layer 1: Soft dark tint */}
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(0, 0, 0, 0.25)'
              }}
            />
            
            {/* Layer 2: Bottom gradient for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.70) 100%)'
              }}
            />
          </div>

          {/* Content */}
          <div className="relative p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  {packInfo.label}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>
                  Catalogue of Life taxonomy pack
                </p>
              </div>
              
              {/* Micro-contrast scrim layer behind badge */}
              <div className="relative flex-shrink-0" style={{ width: '100px', height: '44px' }}>
                {/* Local gradient scrim for worst-case bright backgrounds */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.35))'
                  }}
                />
                
                {/* High-contrast glass pill badge */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className="px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap"
                    style={{
                      background: 'rgba(0, 0, 0, 0.55)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)', // Safari support
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)'
                    }}
                  >
                    {statusDisplay.label}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm mb-2" style={{ color: '#C9CBD6' }}>
              {packInfo.description}
            </p>
            <p className="text-xs" style={{ color: '#8E91A3' }}>
              {(() => {
                const taxaCount = packInfo.taxa_count ?? null;
                if (typeof taxaCount === 'number' && taxaCount > 0) {
                  return <>Taxa in pack: <strong style={{ color: '#FFFFFF' }}>{taxaCount.toLocaleString()}</strong></>;
                } else {
                  return <>Taxa in pack: <strong style={{ color: '#FFFFFF' }}>Count unavailable</strong></>;
                }
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* LOCAL DATABASE - TWO SEPARATE SUB-CARDS FOR TAXA AND SYNONYMS */}
      <div className="px-4 space-y-3">
        {/* TAXA SUB-CARD */}
        <div
          className="rounded-[18px] overflow-hidden relative p-4 space-y-3"
          style={{
            background: '#14151A',
            border: '1px solid #242632'
          }}
        >
          <div>
            <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
              Taxa
            </h3>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>
              {isTaxaSyncing
                ? 'Syncing'
                : taxonRowCount === 0
                  ? 'Not downloaded'
                  : packInfo && packInfo.taxa_count && taxonRowCount >= packInfo.taxa_count
                    ? 'Up to date'
                    : 'Download incomplete'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
              Stored taxa: <strong style={{ color: '#FFFFFF' }}>
                {isTaxaSyncing ? (taxaProgress.taxonCount || 0).toLocaleString() : taxonRowCount.toLocaleString()}
              </strong>
              {packInfo && packInfo.taxa_count && (
                <> of <strong style={{ color: '#FFFFFF' }}>{packInfo.taxa_count.toLocaleString()}</strong></>
              )}
            </p>
          </div>

          {/* Progress bar (shown when syncing OR incomplete) */}
          {(isTaxaSyncing || (taxonRowCount > 0 && packInfo && packInfo.taxa_count && taxonRowCount < packInfo.taxa_count)) && (
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A1C22' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: isTaxaSyncing 
                    ? `${taxaProgress.progressPercent || 0}%`
                    : packInfo && packInfo.taxa_count 
                      ? `${Math.round((taxonRowCount / packInfo.taxa_count) * 100)}%`
                      : '0%',
                  background: 'linear-gradient(90deg, #D2110C, #FF4136)',
                  boxShadow: '0 0 8px rgba(210, 17, 12, 0.5)'
                }}
              />
            </div>
          )}

          {/* PERSISTENT DEBUG BOX (always visible if debug data exists) */}
          {(debugLastIdSent !== null || debugLastUpdatedAt !== null) && (
            <div 
              className="p-3 rounded-lg space-y-2"
              style={{ 
                background: 'rgba(251, 176, 36, 0.08)', 
                border: '1px solid rgba(251, 176, 36, 0.25)'
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold" style={{ color: '#FBB024' }}>
                  Debug
                </p>
                <button
                  onClick={clearDebugData}
                  className="text-xs underline"
                  style={{ color: '#FBB024' }}
                >
                  Clear debug
                </button>
              </div>
              
              <div className="text-xs font-mono space-y-1" style={{ color: '#FBB024' }}>
                <p>Debug — sending last_seq: {debugLastIdSent || 0}</p>
                {debugFirstIdReceived !== null && debugLastIdReceived !== null && debugRowsCount !== null && (
                  <p>Debug — received page: first_seq={debugFirstIdReceived} last_seq={debugLastIdReceived} rows={debugRowsCount}</p>
                )}
              </div>
              
              {debugLastUpdatedAt && (
                <p className="text-xs" style={{ color: '#8E91A3' }}>
                  Last updated: {new Date(debugLastUpdatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* DEBUG: Show current last_seq being sent to Supabase */}
          {isTaxaSyncing && (
            <div 
              className="text-xs font-mono p-2 rounded"
              style={{ 
                background: 'rgba(251, 176, 36, 0.1)', 
                border: '1px solid rgba(251, 176, 36, 0.3)',
                color: '#FBB024'
              }}
            >
              Debug — sending last_seq: {taxaProgress.lastCheckpoint || 0}
            </div>
          )}

          {/* Live progress info during sync */}
          {isTaxaSyncing && (
            <div className="text-xs space-y-1" style={{ color: '#8E91A3' }}>
              <p>Progress: <strong style={{ color: '#FFFFFF' }}>{taxaProgress.progressPercent || 0}%</strong></p>
              {taxaProgress.lastCheckpoint && (
                <p>Last checkpoint: <strong style={{ color: '#C9CBD6' }}>{taxaProgress.lastCheckpoint}</strong></p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTaxa}
              disabled={isTaxaSyncing}
              className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-sm"
              style={{
                opacity: isTaxaSyncing ? 0.5 : 1,
                cursor: isTaxaSyncing ? 'not-allowed' : 'pointer'
              }}
            >
              {isTaxaSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {taxonRowCount === 0 ? 'Download taxa' : 'Update taxa'}
                </>
              )}
            </button>
            {taxonRowCount > 0 && (
              <button
                onClick={handleResetTaxa}
                disabled={isTaxaSyncing}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid #D2110C',
                  color: '#D2110C',
                  opacity: isTaxaSyncing ? 0.5 : 1,
                  cursor: isTaxaSyncing ? 'not-allowed' : 'pointer'
                }}
              >
                Reset taxa
              </button>
            )}
          </div>
        </div>

        {/* SYNONYMS SUB-CARD */}
        <div
          className="rounded-[18px] overflow-hidden relative p-4 space-y-3"
          style={{
            background: '#14151A',
            border: '1px solid #242632'
          }}
        >
          <div>
            <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
              Synonyms
            </h3>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>
              {isSynSyncing
                ? 'Syncing'
                : synonymRowCount === 0
                  ? 'Not downloaded'
                  : synDone
                    ? 'Up to date'
                    : 'Download incomplete'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
              Stored synonyms: <strong style={{ color: '#FFFFFF' }}>{synonymRowCount.toLocaleString()}</strong>
            </p>
            {synonymRowCount > 0 && taxonRowCount === 0 && (
              <p className="text-xs mt-1" style={{ color: '#FBB024' }}>
                Download taxa to resolve accepted names for synonym matches.
              </p>
            )}
          </div>

          {/* Progress bar (shown when syncing OR incomplete) */}
          {isSynSyncing && (
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A1C22' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${synProgress.progressPercent || 0}%`,
                  background: 'linear-gradient(90deg, #D2110C, #FF4136)',
                  boxShadow: '0 0 8px rgba(210, 17, 12, 0.5)'
                }}
              />
            </div>
          )}

          {/* Live progress info during sync */}
          {isSynSyncing && (
            <div className="text-xs space-y-1" style={{ color: '#8E91A3' }}>
              <p>Progress: <strong style={{ color: '#FFFFFF' }}>{synProgress.progressPercent || 0}%</strong></p>
              {synProgress.lastCheckpoint && (
                <p>Last checkpoint: <strong style={{ color: '#C9CBD6' }}>{synProgress.lastCheckpoint}</strong></p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadSynonyms}
              disabled={isSynSyncing}
              className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-sm"
              style={{
                opacity: isSynSyncing ? 0.5 : 1,
                cursor: isSynSyncing ? 'not-allowed' : 'pointer'
              }}
            >
              {isSynSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {synonymRowCount === 0 ? 'Download synonyms' : 'Update synonyms'}
                </>
              )}
            </button>
            {synonymRowCount > 0 && (
              <button
                onClick={handleResetSynonyms}
                disabled={isSynSyncing}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid #D2110C',
                  color: '#D2110C',
                  opacity: isSynSyncing ? 0.5 : 1,
                  cursor: isSynSyncing ? 'not-allowed' : 'pointer'
                }}
              >
                Reset synonyms
              </button>
            )}
          </div>
        </div>

        {/* PACK-WIDE REMOVE BUTTON (separate from sub-cards) */}
        {isInstalled && (
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'transparent',
              border: '1px solid #D2110C',
              color: '#D2110C'
            }}
          >
            Remove pack
          </button>
        )}
      </div>

      {/* Download error with stall detection */}
      {downloadError && !isSyncing && (
        <div
          className="rounded-[18px] card-shadow p-4 space-y-3"
          style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: '#D2110C' }}>
                {downloadError.includes('stalled') ? 'Sync stalled' : 'Download failed'}
              </p>
              <p className="text-sm" style={{ color: '#D2110C' }}>
                {downloadError.includes('stalled') 
                  ? 'The server returned the same page repeatedly. Tap Update pack to retry. If it persists, remove and download again.'
                  : downloadError
                }
              </p>
            </div>
            <button onClick={() => setDownloadError(null)}>
              <X className="w-4 h-4" style={{ color: '#D2110C' }} />
            </button>
          </div>
          
          {/* Diagnostics */}
          {taxaProgress.rowsReceived !== undefined && (
            <div className="text-xs space-y-1 pt-2 border-t" style={{ borderColor: 'rgba(210, 17, 12, 0.2)', color: '#C9CBD6' }}>
              <p>Rows received from server: <strong style={{ color: '#FFFFFF' }}>{taxaProgress.rowsReceived}</strong></p>
              <p>Rows matched this pack: <strong style={{ color: '#FFFFFF' }}>{taxaProgress.rowsMatched || 0}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* Search within pack (only if downloaded) */}
      {isInstalled && (
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

          {/* Search results */}
          {searchQuery.length >= 2 ? (
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
                        <p className="font-semibold italic truncate" style={{ color: '#FFFFFF' }}>
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
                          background: result.matchType === 'accepted' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: result.matchType === 'accepted' ? '#34D399' : '#FBB024'
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
          ) : (
            /* Index list - show when not searching */
            <div>
              <div className="mb-3">
                <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Index</h3>
                <p className="text-xs" style={{ color: '#8E91A3' }}>
                  {taxonRowCount > 0 
                    ? `Showing 30 of ${taxonRowCount.toLocaleString()} stored taxa`
                    : 'Recently added'
                  }
                </p>
              </div>
              
              {indexLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: '#8E91A3' }}>Loading...</p>
                </div>
              ) : indexList.length > 0 ? (
                <div className="space-y-2">
                  {indexList.map((taxon, index) => (
                    <button
                      key={`${taxon.id}-${index}`}
                      onClick={() => handleSelectSpecies({ taxon, matchType: 'accepted' })}
                      className="w-full rounded-[18px] card-shadow p-4 text-left transition-all active:scale-98"
                      style={{ background: '#14151A', border: '1px solid #242632' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold italic truncate" style={{ color: '#FFFFFF' }}>
                            {taxon.scientific_name}
                          </p>
                          <p className="text-sm truncate" style={{ color: '#C9CBD6' }}>
                            {taxon.rank} • {taxon.kingdom || 'Unknown'}
                            {taxon.authorship && ` • ${taxon.authorship}`}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                          style={{
                            background: 'rgba(52, 211, 153, 0.15)',
                            color: '#34D399'
                          }}
                        >
                          Accepted
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Empty state - pack downloaded but no rows */
                <div className="rounded-[18px] card-shadow p-6 text-center space-y-4"
                  style={{ background: '#14151A', border: '1px solid #242632' }}
                >
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
                      No taxa found in this pack
                    </h4>
                    <p className="text-sm" style={{ color: '#C9CBD6' }}>
                      The download finished but no rows were stored. Try Update pack. If it persists, remove and download again.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleDownload}
                      className="btn-primary py-2.5"
                    >
                      Update pack
                    </button>
                    <button
                      onClick={() => setShowRemoveConfirm(true)}
                      className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: 'transparent',
                        border: '1px solid #D2110C',
                        color: '#D2110C'
                      }}
                    >
                      Remove pack
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Remove confirmation modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div
            className="rounded-[22px] card-shadow-raised max-w-md w-full p-6 animate-slide-up"
            style={{ background: '#1A1C22' }}
          >
            <h2 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              Remove this pack?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#C9CBD6' }}>
              This deletes both taxa and synonyms for this pack from on-device storage. You can download them again anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 py-3 px-4 rounded-xl text-base font-semibold"
                style={{
                  background: '#D2110C',
                  color: '#FFFFFF'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Species Detail Bottom Sheet */}
      {showSpeciesDetail && selectedSpecies && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div
            className="rounded-t-[22px] card-shadow-raised w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
            style={{ background: '#1A1C22' }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: '#242632' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-xl font-bold italic" style={{ color: '#FFFFFF' }}>
                    {selectedSynonymName || selectedSpecies.scientific_name}
                  </p>
                  {selectedSynonymName && (
                    <p className="text-sm italic mt-1" style={{ color: '#8E91A3' }}>
                      Accepted: {selectedSpecies.scientific_name}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowSpeciesDetail(false)}>
                  <X className="w-6 h-6" style={{ color: '#C9CBD6' }} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Rank</p>
                <p className="text-sm capitalize" style={{ color: '#FFFFFF' }}>{selectedSpecies.rank}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Kingdom</p>
                <p className="text-sm" style={{ color: '#FFFFFF' }}>{selectedSpecies.kingdom || 'Unknown'}</p>
              </div>
              {selectedSpecies.authorship && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Authorship</p>
                  <p className="text-sm" style={{ color: '#FFFFFF' }}>{selectedSpecies.authorship}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUseInAssessment}
                  className="flex-1 btn-primary py-3"
                >
                  Use in assessment
                </button>
                <button
                  onClick={handleCopyName}
                  className="px-4 py-3 rounded-xl transition-all"
                  style={{ background: '#14151A', border: '1px solid #242632' }}
                >
                  <Copy className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                </button>
              </div>

              <p className="text-xs text-center pt-2" style={{ color: '#8E91A3' }}>
                Taxonomy source: Catalogue of Life. IUCN SIS taxonomy may differ.
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
}