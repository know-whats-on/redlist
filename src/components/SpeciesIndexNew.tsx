import React, { useState, useEffect } from 'react';
import { Search, Download, Check, Loader, Database, AlertCircle } from 'lucide-react';
import { fetchTaxonomyPacks, groupPacksByPhylum, TaxonomyPack } from '../lib/taxonomyPackService';
import { taxonomyDb } from '../lib/taxonomyDb';
import { PackDetailPage } from './PackDetailPage';
import { getPhylumBannerImage, getPhylumGradientFallback } from '../lib/phylumBannerImages';

type FilterType = 'all' | 'downloaded' | 'not-downloaded';

export function SpeciesIndexNew() {
  const [packs, setPacks] = useState<TaxonomyPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [downloadedPacksWithCounts, setDownloadedPacksWithCounts] = useState<Map<string, { taxaCount: number; synCount: number }>>(new Map());
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<'not-downloaded' | 'ready' | 'syncing'>('not-downloaded');

  useEffect(() => {
    loadPacks();
    loadDownloadedStatus();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const packsData = await fetchTaxonomyPacks();
      setPacks(packsData);
    } catch (error) {
      console.error('Failed to load packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDownloadedStatus = async () => {
    // Get installed packs with actual stored counts
    const installedWithMeta = await taxonomyDb.getInstalledPacksWithMeta();
    
    const countsMap = new Map<string, { taxaCount: number; synCount: number }>();
    installedWithMeta.forEach(meta => {
      countsMap.set(meta.pack_id, {
        taxaCount: meta.taxa_count,
        synCount: meta.syn_count
      });
    });
    
    setDownloadedPacksWithCounts(countsMap);

    // Update overall status
    if (countsMap.size > 0) {
      setOverallStatus('ready');
    } else {
      setOverallStatus('not-downloaded');
    }
  };

  // Refresh when coming back from pack detail
  useEffect(() => {
    if (!selectedPackId) {
      loadDownloadedStatus();
    }
  }, [selectedPackId]);

  // If a pack is selected, show its detail page
  if (selectedPackId) {
    return (
      <PackDetailPage
        packId={selectedPackId}
        onBack={() => setSelectedPackId(null)}
      />
    );
  }

  // Group packs by phylum
  const grouped = groupPacksByPhylum(packs);
  const phylums = Array.from(grouped.keys()).sort();

  // Filter packs
  const filteredPhylums = phylums.filter(phylum => {
    const phylumPacks = grouped.get(phylum) || [];
    
    return phylumPacks.some(pack => {
      // Search filter
      const matchesSearch = searchQuery.length === 0 || 
        pack.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.phylum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Download filter
      const isDownloaded = downloadedPacksWithCounts.has(pack.id);
      if (filterType === 'downloaded' && !isDownloaded) return false;
      if (filterType === 'not-downloaded' && isDownloaded) return false;

      return true;
    });
  });

  const formatCount = (count: number) => {
    return count.toLocaleString();
  };

  const getStatusBadge = (packId: string) => {
    const downloaded = downloadedPacksWithCounts.get(packId);
    if (!downloaded) {
      return { label: 'Not downloaded', color: '#8E91A3', bg: 'rgba(142, 145, 163, 0.15)' };
    }
    return { label: 'Downloaded', color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)' };
  };

  return (
    <div className="space-y-4" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              Species Index
            </h2>
            <p className="text-sm mt-1" style={{ color: '#8E91A3' }}>
              Catalogue of Life packs on this device
            </p>
          </div>
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
            style={{
              background: overallStatus === 'ready' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(142, 145, 163, 0.15)',
              color: overallStatus === 'ready' ? '#34D399' : '#8E91A3'
            }}
          >
            {overallStatus === 'ready' ? 'Ready' : 'Not downloaded'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 space-y-3">
        {/* Search packs */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: '#8E91A3' }}
          />
          <input
            type="text"
            placeholder="Search packs"
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

        {/* Filter chips */}
        <div className="flex gap-2">
          {(['all', 'downloaded', 'not-downloaded'] as FilterType[]).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: filterType === type ? 'rgba(210, 17, 12, 0.15)' : '#14151A',
                border: `1px solid ${filterType === type ? '#D2110C' : '#242632'}`,
                color: filterType === type ? '#D2110C' : '#8E91A3'
              }}
            >
              {type === 'all' ? 'All' : type === 'downloaded' ? 'Downloaded' : 'Not downloaded'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-4 py-12 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#8E91A3' }} />
          <p className="text-sm" style={{ color: '#8E91A3' }}>Loading packs...</p>
        </div>
      )}

      {/* BANNER SECTIONS PER PHYLUM */}
      {!loading && filteredPhylums.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-sm" style={{ color: '#8E91A3' }}>No packs found</p>
        </div>
      )}

      {!loading && filteredPhylums.map(phylum => {
        const phylumPacks = (grouped.get(phylum) || []).filter(pack => {
          // Apply same filters as filteredPhylums
          const matchesSearch = searchQuery.length === 0 || 
            pack.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pack.phylum.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pack.description.toLowerCase().includes(searchQuery.toLowerCase());

          if (!matchesSearch) return false;

          const isDownloaded = downloadedPacksWithCounts.has(pack.id);
          if (filterType === 'downloaded' && !isDownloaded) return false;
          if (filterType === 'not-downloaded' && isDownloaded) return false;

          return true;
        });

        const downloadedCount = phylumPacks.filter(p => downloadedPacksWithCounts.has(p.id)).length;
        const totalCount = phylumPacks.length;
        const bannerImage = getPhylumBannerImage(phylum);
        const gradientFallback = getPhylumGradientFallback(phylum);

        return (
          <div key={phylum} className="px-4">
            {/* PHYLUM BANNER SECTION (heading + pack cards inside) */}
            <div
              className="rounded-[22px] overflow-hidden relative"
              style={{
                background: '#14151A',
                border: '1px solid #242632',
                minHeight: '160px' // Increased height to show imagery
              }}
            >
              {/* Banner background image with brightness boost */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${bannerImage})`,
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

              {/* Content (relative to overlay) */}
              <div className="relative p-4 space-y-3">
                {/* Section header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                      {phylum}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#C9CBD6' }}>
                      {totalCount} {totalCount === 1 ? 'pack' : 'packs'} available
                    </p>
                  </div>
                  
                  {/* Micro-contrast scrim layer behind badge */}
                  <div className="relative flex-shrink-0" style={{ width: '120px', height: '44px' }}>
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
                        Downloaded {downloadedCount} / {totalCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pack mini-banner cards with glass effect */}
                {phylumPacks.map(pack => {
                  const statusBadge = getStatusBadge(pack.id);
                  
                  return (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPackId(pack.id)}
                      className="w-full rounded-[18px] p-4 text-left transition-all active:scale-98"
                      style={{
                        background: 'rgba(20, 21, 26, 0.72)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        backdropFilter: 'blur(12px)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate" style={{ color: '#FFFFFF' }}>
                            {pack.label}
                          </h4>
                          <p className="text-xs truncate mt-0.5" style={{ color: '#C9CBD6' }}>
                            {pack.description}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                          style={{
                            background: statusBadge.bg,
                            color: statusBadge.color
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#8E91A3' }}>
                        Taxa in pack: <strong style={{ color: '#FFFFFF' }}>{formatCount(pack.taxa_count || 0)}</strong>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}