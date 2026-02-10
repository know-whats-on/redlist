import React, { useState, useEffect } from 'react';
import { Search, BookOpen, FileText, Check, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { ModulePlayer } from './ModulePlayer';
import { RegionModule } from './RegionModule';
import { SpeciesIndexNew } from './SpeciesIndexNew';

interface Taxon {
  id: string;
  commonName: string;
  scientificName: string;
  regionalCategory?: string;
  globalCategory?: string;
  lastAssessed?: string;
}

interface ModuleProgress {
  step1: number;
  step2: number;
  step3: number;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  usedIn: ('Step 1' | 'Step 2' | 'Step 3')[];
}

export function Library() {
  const [activeTab, setActiveTab] = useState<'modules' | 'glossary' | 'species'>('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [taxa, setTaxa] = useState<Taxon[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({ step1: 0, step2: 0, step3: 0 });
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [activeModule, setActiveModule] = useState<1 | 2 | 3 | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedRegionModule, setSelectedRegionModule] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('assessments');
    if (stored) {
      const assessments = JSON.parse(stored);
      const taxaList: Taxon[] = assessments.map((a: any) => ({
        id: a.id,
        commonName: a.taxonName,
        scientificName: a.scientificName,
        regionalCategory: a.step3?.finalCategory || a.step2?.preliminaryCategory,
        lastAssessed: a.lastModified,
      }));
      setTaxa(taxaList);
    }

    // Load module progress
    const storedProgress = localStorage.getItem('moduleProgress');
    if (storedProgress) {
      setModuleProgress(JSON.parse(storedProgress));
    }

    // Listen for navigation events from FAB and Home
    const handleOpenModule = (event: any) => {
      const { moduleId } = event.detail;
      setActiveModule(moduleId);
    };
    const handleScrollToRegionModules = () => {
      setActiveTab('modules');
      setTimeout(() => {
        const regionModulesSection = document.querySelector('h3:contains("Region Modules")');
        if (regionModulesSection) {
          regionModulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };
    const handleOpenGlossary = () => {
      setActiveTab('glossary');
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    };

    window.addEventListener('openModule', handleOpenModule as EventListener);
    window.addEventListener('scrollToRegionModules', handleScrollToRegionModules);
    window.addEventListener('openGlossary', handleOpenGlossary);

    return () => {
      window.removeEventListener('openModule', handleOpenModule as EventListener);
      window.removeEventListener('scrollToRegionModules', handleScrollToRegionModules);
      window.removeEventListener('openGlossary', handleOpenGlossary);
    };
  }, []);

  const filteredTaxa = taxa.filter(
    (t) =>
      t.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const glossaryTerms: GlossaryTerm[] = [
    {
      term: 'Benign introduction',
      definition: 'Establishing a taxon for conservation outside its recorded distribution but in appropriate habitat/ecogeographical area; used when no remaining area in historic range.',
      usedIn: ['Step 1']
    },
    {
      term: 'Breeding population',
      definition: 'A (sub)population that reproduces within the region (entire or essential part of cycle).',
      usedIn: ['Step 1']
    },
    {
      term: 'Conspecific population',
      definition: 'Populations of the same species (unit at or below species level).',
      usedIn: ['Step 3']
    },
    {
      term: 'Downlisting / Uplisting',
      definition: 'Adjusting regional category down/up based on decreased/increased extinction risk.',
      usedIn: ['Step 3']
    },
    {
      term: 'Endemic taxon',
      definition: 'Naturally found in a specific area and nowhere else (relative term).',
      usedIn: ['Step 1', 'Step 2']
    },
    {
      term: 'Global population',
      definition: 'Total number of individuals of a taxon.',
      usedIn: ['Step 2', 'Step 3']
    },
    {
      term: 'Metapopulation',
      definition: 'Collection of subpopulations in habitat patches; survival depends on extinction vs (re)colonization rates.',
      usedIn: ['Step 2']
    },
    {
      term: 'Natural range',
      definition: 'Range excluding parts resulting from introductions; delimitation decisions are left to regional authority.',
      usedIn: ['Step 1']
    },
    {
      term: 'Not Applicable (NA)',
      definition: 'Ineligible for regional assessment (not wild/natural range, vagrant, very low numbers under a filter, or below eligible taxonomic level).',
      usedIn: ['Step 1']
    },
    {
      term: 'Population',
      definition: 'In IUCN sense: total number of individuals of the taxon; in regional context, "global population" may be used for clarity.',
      usedIn: ['Step 2']
    },
    {
      term: 'Propagule',
      definition: 'Dispersal-capable entity producing a new mature individual (spore/seed/egg/larva/etc.); not gametes/pollen.',
      usedIn: ['Step 3']
    },
    {
      term: 'Region',
      definition: 'Subglobal area (continent/country/state/province).',
      usedIn: ['Step 1', 'Step 2', 'Step 3']
    },
    {
      term: 'Regional assessment',
      definition: 'Determining relative extinction risk of a regional population per these guidelines.',
      usedIn: ['Step 1', 'Step 2', 'Step 3']
    },
    {
      term: 'Regionally Extinct (RE)',
      definition: 'No reasonable doubt last potentially reproductive individual in region has died/disappeared; time limit is region-defined but should not normally pre-date 1500 AD.',
      usedIn: ['Step 1']
    },
    {
      term: 'Regional population',
      definition: 'Portion of the global population within the region (may include multiple subpopulations).',
      usedIn: ['Step 2', 'Step 3']
    },
    {
      term: 'Rescue effect',
      definition: 'Immigrating propagules reduce extinction risk of target population.',
      usedIn: ['Step 3']
    },
    {
      term: 'Sink',
      definition: 'Area where reproduction < mortality; often maintained by immigration from a source.',
      usedIn: ['Step 3']
    },
    {
      term: 'Subpopulations',
      definition: 'Distinct groups with little demographic/genetic exchange (typically ≤1 successful migrant per year).',
      usedIn: ['Step 2']
    },
    {
      term: 'Taxon',
      definition: 'Species or infraspecific entity being assessed.',
      usedIn: ['Step 1', 'Step 2', 'Step 3']
    },
    {
      term: 'Vagrant',
      definition: 'Taxon found only occasionally within a region\'s boundaries.',
      usedIn: ['Step 1']
    },
    {
      term: 'Visitor (visiting taxon)',
      definition: 'Does not reproduce in region but regularly occurs now or during some period of last century; regions define boundary between visitors and vagrants (e.g., % global pop or predictability).',
      usedIn: ['Step 1']
    },
    {
      term: 'Wild population',
      definition: 'Within natural range; individuals result of natural reproduction (benign introductions can be considered wild if self-sustaining).',
      usedIn: ['Step 1']
    }
  ];

  const filteredGlossary = glossaryTerms.filter((term) => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !selectedLetter || term.term.charAt(0).toUpperCase() === selectedLetter;
    return matchesSearch && matchesLetter;
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 safe-area-top" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <h1 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Library</h1>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>Modules and glossary</p>
      </header>

      {/* Tabs - Fixed alignment and scroll */}
      <div className="sticky top-0 z-10" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <div className="overflow-x-auto hide-scrollbar" style={{ height: '54px' }}>
          <div className="flex gap-[18px] px-4 h-full" style={{ whiteSpace: 'nowrap' }}>
            <button
              onClick={() => setActiveTab('modules')}
              className="relative font-semibold transition-colors flex-shrink-0 pb-3 pt-4"
              style={{
                fontSize: '15px',
                color: activeTab === 'modules' ? '#D2110C' : 'rgba(255, 255, 255, 0.6)'
              }}
            >
              Modules
              {activeTab === 'modules' && (
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-200"
                  style={{ 
                    height: '3px', 
                    background: '#D2110C',
                    borderRadius: '3px 3px 0 0'
                  }} 
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className="relative font-semibold transition-colors flex-shrink-0 pb-3 pt-4"
              style={{
                fontSize: '15px',
                color: activeTab === 'glossary' ? '#D2110C' : 'rgba(255, 255, 255, 0.6)'
              }}
            >
              Glossary
              {activeTab === 'glossary' && (
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-200"
                  style={{ 
                    height: '3px', 
                    background: '#D2110C',
                    borderRadius: '3px 3px 0 0'
                  }} 
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('species')}
              className="relative font-semibold transition-colors flex-shrink-0 pb-3 pt-4"
              style={{
                fontSize: '15px',
                color: activeTab === 'species' ? '#D2110C' : 'rgba(255, 255, 255, 0.6)'
              }}
            >
              Species Index
              {activeTab === 'species' && (
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-200"
                  style={{ 
                    height: '3px', 
                    background: '#D2110C',
                    borderRadius: '3px 3px 0 0'
                  }} 
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      {(activeTab === 'modules' || activeTab === 'glossary') && (
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#8E91A3' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'modules' ? 'Search modules...' : 'Search terms...'
              }
              className="w-full pl-12 pr-4 py-3 rounded-lg"
              style={{ background: '#14151A', border: '1px solid #242632', color: '#FFFFFF' }}
            />
          </div>
        </div>
      )}

      {/* Alphabet Filter for Glossary */}
      {activeTab === 'glossary' && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter('')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: selectedLetter === '' ? '#D2110C' : 'transparent',
                border: `1px solid ${selectedLetter === '' ? '#D2110C' : '#242632'}`,
                color: selectedLetter === '' ? '#FFFFFF' : '#8E91A3'
              }}
            >
              All
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: selectedLetter === letter ? '#D2110C' : 'transparent',
                  border: `1px solid ${selectedLetter === letter ? '#D2110C' : '#242632'}`,
                  color: selectedLetter === letter ? '#FFFFFF' : '#8E91A3'
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-6 content-safe-bottom">
        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Core Method Modules */}
            <div className="space-y-4">
              <LibraryModuleCard
                step={1}
                title="Step 1 — Eligibility"
                subtitle="Taxon & population inclusion rules"
                progress={moduleProgress.step1}
                onActivate={() => setActiveModule(1)}
                isActive={activeModule === 1}
              />
              <LibraryModuleCard
                step={2}
                title="Step 2 — Preliminary Category"
                subtitle="Apply criteria using regional data"
                progress={moduleProgress.step2}
                onActivate={() => setActiveModule(2)}
                isActive={activeModule === 2}
              />
              <LibraryModuleCard
                step={3}
                title="Step 3 — Adjustment"
                subtitle="Rescue effect & sink logic"
                progress={moduleProgress.step3}
                onActivate={() => setActiveModule(3)}
                isActive={activeModule === 3}
              />
            </div>

            {/* Region Modules */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>Region Modules</h3>
                <p className="text-sm" style={{ color: '#8E91A3' }}>
                  Region-specific definitions and policies that affect assessments
                </p>
              </div>
              <div className="space-y-3">
                <RegionModuleCard
                  regionId="north-america"
                  name="North America"
                  authority="NatureServe"
                  onOpen={() => setSelectedRegionModule('north-america')}
                />
                <RegionModuleCard
                  regionId="central-america"
                  name="Central America"
                  authority="Regional Authority"
                  onOpen={() => setSelectedRegionModule('central-america')}
                />
                <RegionModuleCard
                  regionId="south-america"
                  name="South America"
                  authority="IUCN Americas"
                  onOpen={() => setSelectedRegionModule('south-america')}
                />
                <RegionModuleCard
                  regionId="europe"
                  name="Europe"
                  authority="European Red List"
                  onOpen={() => setSelectedRegionModule('europe')}
                />
                <RegionModuleCard
                  regionId="africa"
                  name="Africa"
                  authority="IUCN Africa"
                  onOpen={() => setSelectedRegionModule('africa')}
                />
                <RegionModuleCard
                  regionId="middle-east"
                  name="Middle East"
                  authority="Regional Authority"
                  onOpen={() => setSelectedRegionModule('middle-east')}
                />
                <RegionModuleCard
                  regionId="central-asia"
                  name="Central Asia"
                  authority="Regional Authority"
                  onOpen={() => setSelectedRegionModule('central-asia')}
                />
                <RegionModuleCard
                  regionId="south-asia"
                  name="South Asia"
                  authority="IUCN Asia"
                  onOpen={() => setSelectedRegionModule('south-asia')}
                />
                <RegionModuleCard
                  regionId="southeast-asia"
                  name="Southeast Asia"
                  authority="ASEAN Centre"
                  onOpen={() => setSelectedRegionModule('southeast-asia')}
                />
                <RegionModuleCard
                  regionId="east-asia"
                  name="East Asia"
                  authority="Regional Authority"
                  onOpen={() => setSelectedRegionModule('east-asia')}
                />
                <RegionModuleCard
                  regionId="australia-nz"
                  name="Australia & New Zealand"
                  authority="EPBC Act / DOC NZ"
                  onOpen={() => setSelectedRegionModule('australia-nz')}
                />
                <RegionModuleCard
                  regionId="oceania-pacific"
                  name="Oceania & Pacific Islands"
                  authority="SPREP"
                  onOpen={() => setSelectedRegionModule('oceania-pacific')}
                />
                <RegionModuleCard
                  regionId="arctic"
                  name="Arctic"
                  authority="CAFF"
                  onOpen={() => setSelectedRegionModule('arctic')}
                />
                <RegionModuleCard
                  regionId="antarctica"
                  name="Antarctica"
                  authority="SCAR"
                  onOpen={() => setSelectedRegionModule('antarctica')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div className="space-y-2">
            {filteredGlossary.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#8E91A3' }} />
                <p style={{ color: '#C9CBD6' }}>No terms found</p>
              </div>
            )}
            {filteredGlossary.map((item) => (
              <GlossaryTermCard
                key={item.term}
                term={item.term}
                definition={item.definition}
                usedIn={item.usedIn}
                isExpanded={expandedTerm === item.term}
                onToggle={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
              />
            ))}
          </div>
        )}

        {/* Species Tab */}
        {activeTab === 'species' && (
          <SpeciesIndexNew />
        )}
      </div>

      {/* Module Player */}
      {activeModule && (
        <ModulePlayer
          moduleId={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={() => {
            setActiveModule(null);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            // Reload progress
            const storedProgress = localStorage.getItem('moduleProgress');
            if (storedProgress) {
              setModuleProgress(JSON.parse(storedProgress));
            }
          }}
        />
      )}

      {/* Region Module */}
      {selectedRegionModule && (
        <RegionModule
          regionId={selectedRegionModule}
          onClose={() => setSelectedRegionModule(null)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-lg animate-slide-down"
          style={{ background: '#10B981', color: '#FFFFFF' }}
        >
          <p className="text-sm font-semibold">✓ Module completed!</p>
        </div>
      )}
    </div>
  );
}

interface LibraryModuleCardProps {
  step: number;
  title: string;
  subtitle: string;
  progress: number;
  onActivate: () => void;
  isActive: boolean;
}

function LibraryModuleCard({ step, title, subtitle, progress, onActivate, isActive }: LibraryModuleCardProps) {
  const isCompleted = progress >= 100;
  const stepColors = {
    1: '#60A5FA',
    2: '#34D399',
    3: '#A78BFA',
  };
  const color = stepColors[step as keyof typeof stepColors];

  return (
    <div className="rounded-[18px] card-shadow p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold mb-1" style={{ color: '#FFFFFF' }}>
            {title}
          </h4>
          <p className="text-sm" style={{ color: '#8E91A3' }}>
            {subtitle}
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
            <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Completed</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: '#C9CBD6' }}>Progress</span>
          <span className="text-xs font-semibold" style={{ color }}>{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1A1C22' }}>
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${progress}%`,
              background: color
            }}
          />
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onActivate}
        className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
        style={{
          background: '#D2110C',
          color: '#FFFFFF'
        }}
      >
        {progress === 0 ? 'Start Module' : progress >= 100 ? 'Review Module' : 'Continue Module'}
      </button>
    </div>
  );
}

interface GlossaryTermCardProps {
  term: string;
  definition: string;
  usedIn: ('Step 1' | 'Step 2' | 'Step 3')[];
  isExpanded: boolean;
  onToggle: () => void;
}

function GlossaryTermCard({ term, definition, usedIn, isExpanded, onToggle }: GlossaryTermCardProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-[18px] card-shadow p-4 text-left transition-all"
      style={{ background: '#14151A', border: '1px solid #242632' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-bold" style={{ color: '#FFFFFF' }}>{term}</h4>
          {isExpanded && (
            <div className="mt-3 space-y-3">
              <p className="text-sm" style={{ color: '#C9CBD6' }}>{definition}</p>
              <div className="flex flex-wrap gap-2">
                {usedIn.map((step) => (
                  <span
                    key={step}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: step === 'Step 1' ? 'rgba(96, 165, 250, 0.15)' :
                                 step === 'Step 2' ? 'rgba(52, 211, 153, 0.15)' :
                                 'rgba(167, 139, 250, 0.15)',
                      color: step === 'Step 1' ? '#60A5FA' :
                             step === 'Step 2' ? '#34D399' :
                             '#A78BFA'
                    }}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#8E91A3' }} />
        ) : (
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: '#8E91A3' }} />
        )}
      </div>
    </button>
  );
}

interface RegionModuleCardProps {
  regionId: string;
  name: string;
  authority: string;
  onOpen: () => void;
}

function RegionModuleCard({ regionId, name, authority, onOpen }: RegionModuleCardProps) {
  const [isReviewed, setIsReviewed] = useState(false);

  useEffect(() => {
    const checkReviewed = () => {
      const reviewed = localStorage.getItem(`regionPolicy_${regionId}_reviewed`);
      setIsReviewed(!!reviewed);
    };

    // Initial check
    checkReviewed();

    // Listen for review updates
    const handleRegionModuleReviewed = (event: any) => {
      if (event.detail.regionId === regionId) {
        checkReviewed();
      }
    };

    window.addEventListener('regionModuleReviewed', handleRegionModuleReviewed);

    return () => {
      window.removeEventListener('regionModuleReviewed', handleRegionModuleReviewed);
    };
  }, [regionId]);

  return (
    <button
      onClick={onOpen}
      className="w-full rounded-[18px] card-shadow p-4 text-left transition-all relative"
      style={{
        background: '#14151A',
        border: '1px solid #242632',
        borderLeft: isReviewed ? '3px solid #34D399' : '1px solid #242632'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold" style={{ color: '#FFFFFF' }}>{name}</h4>
            {isReviewed && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}>
                Reviewed
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: '#8E91A3' }}>Authority: {authority}</p>
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#8E91A3' }} />
      </div>
    </button>
  );
}