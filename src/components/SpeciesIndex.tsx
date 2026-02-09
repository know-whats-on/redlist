import React, { useState, useEffect } from 'react';
import { Search, Download, X, Star, FileText, Check, Upload } from 'lucide-react';

interface SpeciesIndexProps {
  selectedSpecies: string | null;
  onSelectSpecies: (species: string | null) => void;
  onCreateAssessment: (scientificName: string, commonName: string) => void;
}

interface Species {
  id: string;
  scientificName: string;
  authorship?: string;
  commonName?: string;
  rank: string;
  family?: string;
  order?: string;
  class?: string;
  kingdom: string;
  synonyms?: string[];
  pack: string;
}

// Starter Pack - ~50 sample species (would be 2000 in production)
const starterPack: Species[] = [
  { id: '1', scientificName: 'Sialia currucoides', authorship: '(Bechstein, 1798)', commonName: 'Mountain Bluebird', rank: 'species', family: 'Turdidae', order: 'Passeriformes', class: 'Aves', kingdom: 'Animalia', pack: 'starter' },
  { id: '2', scientificName: 'Ursus maritimus', authorship: 'Phipps, 1774', commonName: 'Polar Bear', rank: 'species', family: 'Ursidae', order: 'Carnivora', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '3', scientificName: 'Panthera leo', authorship: '(Linnaeus, 1758)', commonName: 'Lion', rank: 'species', family: 'Felidae', order: 'Carnivora', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '4', scientificName: 'Elephas maximus', authorship: 'Linnaeus, 1758', commonName: 'Asian Elephant', rank: 'species', family: 'Elephantidae', order: 'Proboscidea', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '5', scientificName: 'Panthera tigris', authorship: '(Linnaeus, 1758)', commonName: 'Tiger', rank: 'species', family: 'Felidae', order: 'Carnivora', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '6', scientificName: 'Gorilla gorilla', authorship: '(Savage, 1847)', commonName: 'Western Gorilla', rank: 'species', family: 'Hominidae', order: 'Primates', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '7', scientificName: 'Pongo abelii', authorship: 'Lesson, 1827', commonName: 'Sumatran Orangutan', rank: 'species', family: 'Hominidae', order: 'Primates', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '8', scientificName: 'Chelonia mydas', authorship: '(Linnaeus, 1758)', commonName: 'Green Sea Turtle', rank: 'species', family: 'Cheloniidae', order: 'Testudines', class: 'Reptilia', kingdom: 'Animalia', pack: 'starter' },
  { id: '9', scientificName: 'Crocodylus porosus', authorship: 'Schneider, 1801', commonName: 'Saltwater Crocodile', rank: 'species', family: 'Crocodylidae', order: 'Crocodilia', class: 'Reptilia', kingdom: 'Animalia', pack: 'starter' },
  { id: '10', scientificName: 'Rhincodon typus', authorship: 'Smith, 1828', commonName: 'Whale Shark', rank: 'species', family: 'Rhincodontidae', order: 'Orectolobiformes', class: 'Chondrichthyes', kingdom: 'Animalia', pack: 'starter' },
  { id: '11', scientificName: 'Danaus plexippus', authorship: '(Linnaeus, 1758)', commonName: 'Monarch Butterfly', rank: 'species', family: 'Nymphalidae', order: 'Lepidoptera', class: 'Insecta', kingdom: 'Animalia', pack: 'starter' },
  { id: '12', scientificName: 'Sequoia sempervirens', authorship: '(D.Don) Endl.', commonName: 'Coast Redwood', rank: 'species', family: 'Cupressaceae', order: 'Pinales', class: 'Pinopsida', kingdom: 'Plantae', pack: 'starter' },
  { id: '13', scientificName: 'Welwitschia mirabilis', authorship: 'Hook.f.', commonName: 'Welwitschia', rank: 'species', family: 'Welwitschiaceae', order: 'Gnetales', class: 'Gnetopsida', kingdom: 'Plantae', pack: 'starter' },
  { id: '14', scientificName: 'Haliaeetus leucocephalus', authorship: '(Linnaeus, 1766)', commonName: 'Bald Eagle', rank: 'species', family: 'Accipitridae', order: 'Accipitriformes', class: 'Aves', kingdom: 'Animalia', pack: 'starter' },
  { id: '15', scientificName: 'Canis lupus', authorship: 'Linnaeus, 1758', commonName: 'Gray Wolf', rank: 'species', family: 'Canidae', order: 'Carnivora', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '16', scientificName: 'Ailuropoda melanoleuca', authorship: '(David, 1869)', commonName: 'Giant Panda', rank: 'species', family: 'Ursidae', order: 'Carnivora', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '17', scientificName: 'Balaenoptera musculus', authorship: '(Linnaeus, 1758)', commonName: 'Blue Whale', rank: 'species', family: 'Balaenopteridae', order: 'Cetacea', class: 'Mammalia', kingdom: 'Animalia', pack: 'starter' },
  { id: '18', scientificName: 'Grus americana', authorship: '(Linnaeus, 1758)', commonName: 'Whooping Crane', rank: 'species', family: 'Gruidae', order: 'Gruiformes', class: 'Aves', kingdom: 'Animalia', pack: 'starter' },
  { id: '19', scientificName: 'Rana temporaria', authorship: 'Linnaeus, 1758', commonName: 'Common Frog', rank: 'species', family: 'Ranidae', order: 'Anura', class: 'Amphibia', kingdom: 'Animalia', pack: 'starter' },
  { id: '20', scientificName: 'Salamandra salamandra', authorship: '(Linnaeus, 1758)', commonName: 'Fire Salamander', rank: 'species', family: 'Salamandridae', order: 'Urodela', class: 'Amphibia', kingdom: 'Animalia', pack: 'starter' },
];

export function SpeciesIndex({ selectedSpecies, onSelectSpecies, onCreateAssessment }: SpeciesIndexProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [speciesData, setSpeciesData] = useState<Species[]>(starterPack);
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>(['starter']);
  const [showImportModal, setShowImportModal] = useState(false);

  const groups = [
    { id: 'all', label: 'All', icon: '🌍' },
    { id: 'mammalia', label: 'Mammals', icon: '🦁' },
    { id: 'aves', label: 'Birds', icon: '🦅' },
    { id: 'reptilia', label: 'Reptiles', icon: '🦎' },
    { id: 'amphibia', label: 'Amphibians', icon: '🐸' },
    { id: 'actinopterygii', label: 'Fishes', icon: '🐟' },
    { id: 'insecta', label: 'Invertebrates', icon: '🦋' },
    { id: 'plantae', label: 'Plants', icon: '🌿' },
    { id: 'fungi', label: 'Fungi', icon: '🍄' },
  ];

  const packs = [
    { id: 'starter', name: 'Core Starter Pack (Offline)', size: '2 MB', status: 'installed', lastUpdated: '2025-02-01' },
    { id: 'birds', name: 'Birds Pack', size: '45 MB', status: 'available', lastUpdated: '2025-01-15' },
    { id: 'mammals', name: 'Mammals Pack', size: '38 MB', status: 'available', lastUpdated: '2025-01-20' },
    { id: 'plants', name: 'Plants Pack', size: '120 MB', status: 'available', lastUpdated: '2024-12-10' },
  ];

  const filteredSpecies = speciesData.filter((species) => {
    const matchesSearch = species.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (species.commonName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGroup = selectedGroup === 'all' || species.class?.toLowerCase() === selectedGroup || species.kingdom.toLowerCase() === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleDownloadPack = (packId: string) => {
    // Simulate download
    setDownloadedPacks([...downloadedPacks, packId]);
  };

  const handleRemovePack = (packId: string) => {
    setDownloadedPacks(downloadedPacks.filter(p => p !== packId));
  };

  if (selectedSpecies) {
    const species = speciesData.find(s => s.id === selectedSpecies);
    if (!species) return null;

    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
        {/* Header */}
        <div className="sticky top-0 z-20 px-4 py-4 safe-area-top backdrop-blur-sm bg-black/60" style={{ borderBottom: '1px solid #242632' }}>
          <button
            onClick={() => onSelectSpecies(null)}
            className="text-sm font-semibold flex items-center gap-2 mb-3"
            style={{ color: '#D2110C' }}
          >
            ← Back to Index
          </button>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
            <em>{species.scientificName}</em>
          </h1>
          {species.authorship && (
            <p className="text-sm mb-2" style={{ color: '#8E91A3' }}>{species.authorship}</p>
          )}
          {species.commonName && (
            <p className="text-base" style={{ color: '#C9CBD6' }}>{species.commonName}</p>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4 content-safe-bottom">
          {/* Taxonomy */}
          <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#FFFFFF' }}>Taxonomy</h3>
            <div className="space-y-2">
              {species.kingdom && <TaxonomyRow label="Kingdom" value={species.kingdom} />}
              {species.class && <TaxonomyRow label="Class" value={species.class} />}
              {species.order && <TaxonomyRow label="Order" value={species.order} />}
              {species.family && <TaxonomyRow label="Family" value={species.family} />}
              <TaxonomyRow label="Rank" value={species.rank} />
            </div>
          </div>

          {/* Synonyms */}
          {species.synonyms && species.synonyms.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#FFFFFF' }}>Synonyms</h3>
              <div className="space-y-1">
                {species.synonyms.map((syn, index) => (
                  <p key={index} className="text-sm italic" style={{ color: '#8E91A3' }}>{syn}</p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onCreateAssessment(species.scientificName, species.commonName || '')}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: '#D2110C',
                color: '#FFFFFF'
              }}
            >
              Create Assessment
            </button>
            <button
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '2px solid #242632',
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                Add to Favourites
              </div>
            </button>
            <button
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '2px solid #242632',
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Attach Evidence
              </div>
            </button>
          </div>

          {/* Pack Info */}
          <div className="rounded-lg p-3" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
            <p className="text-xs" style={{ color: '#60A5FA' }}>
              Source: {species.pack === 'starter' ? 'Core Starter Pack' : `${species.pack} Pack`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Landing screen - index with search
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>Species Index</h2>
        <p className="text-sm" style={{ color: '#C9CBD6' }}>
          Search scientific names, browse by group, and download packs for offline use.
        </p>
      </div>

      {/* Global Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#8E91A3' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scientific or common name..."
          className="w-full pl-12 pr-4 py-3 rounded-lg"
          style={{ background: '#14151A', border: '1px solid #242632', color: '#FFFFFF' }}
        />
      </div>

      {/* Browse by Major Group */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#C9CBD6' }}>Browse by Group</h3>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: selectedGroup === group.id ? '#D2110C' : '#14151A',
                border: `1px solid ${selectedGroup === group.id ? '#D2110C' : '#242632'}`,
                color: selectedGroup === group.id ? '#FFFFFF' : '#C9CBD6'
              }}
            >
              <span className="mr-1">{group.icon}</span>
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C9CBD6' }}>
            {filteredSpecies.length} result{filteredSpecies.length !== 1 ? 's' : ''}
          </h3>
          <div className="space-y-2">
            {filteredSpecies.slice(0, 20).map((species) => (
              <button
                key={species.id}
                onClick={() => onSelectSpecies(species.id)}
                className="w-full rounded-xl p-4 text-left transition-all active:scale-98"
                style={{ background: '#14151A', border: '1px solid #242632' }}
              >
                <p className="font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  <em>{species.scientificName}</em>
                </p>
                <div className="flex items-center gap-2">
                  {species.family && (
                    <span className="text-xs" style={{ color: '#8E91A3' }}>{species.family}</span>
                  )}
                  {species.commonName && (
                    <span className="text-xs" style={{ color: '#C9CBD6' }}>• {species.commonName}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Index Packs */}
      {!searchQuery && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C9CBD6' }}>Index Packs</h3>
          <div className="space-y-3">
            {packs.map((pack) => {
              const isDownloaded = downloadedPacks.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  className="rounded-xl p-4"
                  style={{ background: '#14151A', border: '1px solid #242632' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold mb-1" style={{ color: '#FFFFFF' }}>{pack.name}</h4>
                      <p className="text-xs" style={{ color: '#8E91A3' }}>
                        {pack.size} • Updated {new Date(pack.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    {isDownloaded && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                        <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                        <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Downloaded</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isDownloaded ? (
                      <button
                        onClick={() => handleDownloadPack(pack.id)}
                        className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: '#D2110C',
                          color: '#FFFFFF'
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </div>
                      </button>
                    ) : (
                      <>
                        <button
                          className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
                          style={{
                            background: 'transparent',
                            border: '1px solid #242632',
                            color: '#FFFFFF'
                          }}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleRemovePack(pack.id)}
                          className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
                          style={{
                            background: 'transparent',
                            border: '1px solid #242632',
                            color: '#FFFFFF'
                          }}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom Import */}
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full rounded-xl p-4 transition-all"
              style={{ background: '#14151A', border: '2px dashed #242632' }}
            >
              <div className="flex items-center justify-center gap-3">
                <Upload className="w-5 h-5" style={{ color: '#D2110C' }} />
                <div className="text-left">
                  <p className="font-bold" style={{ color: '#FFFFFF' }}>Custom Import (CSV)</p>
                  <p className="text-xs" style={{ color: '#8E91A3' }}>Import regional checklists</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-[22px] card-shadow-raised max-w-md w-full p-6" style={{ background: '#1A1C22' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Import CSV</h2>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-5 h-5" style={{ color: '#8E91A3' }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: '#C9CBD6' }}>
              Upload a CSV file with your regional checklist. Required columns: scientificName. Optional: commonName, family, order, class, authorship, synonyms.
            </p>
            <button
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all mb-3"
              style={{
                background: '#D2110C',
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Choose File
              </div>
            </button>
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '2px solid #242632',
                color: '#FFFFFF'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaxonomyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold" style={{ color: '#8E91A3' }}>{label}</span>
      <span className="text-sm" style={{ color: '#C9CBD6' }}>{value}</span>
    </div>
  );
}
