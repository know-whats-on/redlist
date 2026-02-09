import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Wifi, WifiOff, Play, BookOpen, User, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MockAssessment } from './MockAssessment';

interface HomeProps {
  onStartAssessment: (assessmentId: string) => void;
  onNavigate: (screen: 'home' | 'assess' | 'library' | 'help' | 'profile') => void;
}

interface Assessment {
  id: string;
  taxonName: string;
  scientificName: string;
  status: 'draft' | 'ready-for-review' | 'returned' | 'approved';
  currentStep: number;
  lastModified: string;
  category?: string;
}

interface ModuleProgress {
  step1: number;
  step2: number;
  step3: number;
}

export function Home({ onStartAssessment, onNavigate }: HomeProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMockEntry, setShowMockEntry] = useState(false);
  const [showMockAssessment, setShowMockAssessment] = useState(false);
  const [showMockCompleteToast, setShowMockCompleteToast] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('');
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({ step1: 0, step2: 0, step3: 0 });

  useEffect(() => {
    // Get user name from localStorage
    const storedName = localStorage.getItem('userName') || '';
    setUserName(storedName);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Load assessments from localStorage
    const stored = localStorage.getItem('assessments');
    if (stored) {
      setAssessments(JSON.parse(stored));
    }

    // Load module progress from localStorage
    const storedProgress = localStorage.getItem('moduleProgress');
    if (storedProgress) {
      setModuleProgress(JSON.parse(storedProgress));
    }

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for new assessment trigger from FAB
    const handleOpenNewAssessment = () => setShowNewAssessmentModal(true);
    window.addEventListener('openNewAssessment', handleOpenNewAssessment);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('openNewAssessment', handleOpenNewAssessment);
    };
  }, []);

  const handleCreateNew = () => {
    setShowNewAssessmentModal(true);
  };

  const handleCreateAssessment = (taxonName: string, scientificName: string) => {
    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      taxonName,
      scientificName,
      status: 'draft',
      currentStep: 1,
      lastModified: new Date().toISOString(),
    };
    const updated = [...assessments, newAssessment];
    setAssessments(updated);
    localStorage.setItem('assessments', JSON.stringify(updated));
    setShowNewAssessmentModal(false);
    onStartAssessment(newAssessment.id);
  };

  const handleStartModule = (step: 1 | 2 | 3) => {
    // Navigate to library and open module
    onNavigate('library');
    setTimeout(() => {
      const event = new CustomEvent('openModule', { detail: { moduleId: step } });
      window.dispatchEvent(event);
    }, 100);
  };

  // Determine the next module to show
  const getNextModule = () => {
    if (moduleProgress.step1 < 100) return { step: 1, title: 'Step 1 — Eligibility', subtitle: 'Taxon & population inclusion rules', progress: moduleProgress.step1 };
    if (moduleProgress.step2 < 100) return { step: 2, title: 'Step 2 — Preliminary Category', subtitle: 'Apply criteria using regional data', progress: moduleProgress.step2 };
    if (moduleProgress.step3 < 100) return { step: 3, title: 'Step 3 — Adjustment', subtitle: 'Rescue effect & sink logic', progress: moduleProgress.step3 };
    // All complete, show Step 1 for review
    return { step: 1, title: 'Step 1 — Eligibility', subtitle: 'Taxon & population inclusion rules', progress: moduleProgress.step1 };
  };

  const nextModule = getNextModule();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Top App Bar */}
      <header className="px-4 py-4 safe-area-top sticky top-0 z-20 backdrop-blur-sm bg-black/30">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>RedList Buddy</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4" style={{ color: '#6EE7B7' }} />
              ) : (
                <WifiOff className="w-4 h-4" style={{ color: '#8E91A3' }} />
              )}
            </div>
            <button 
              onClick={() => onNavigate('profile')}
              className="w-10 h-10 rounded-full flex items-center justify-center" 
              style={{ background: '#1A1C22' }}
            >
              <User className="w-5 h-5" style={{ color: '#C9CBD6' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Content with bottom padding */}
      <div className="px-4 py-6 content-safe-bottom space-y-6">
        {/* Hero Greeting - Two Lines */}
        <section className="space-y-0">
          <div>
            <p className="text-lg font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.2 }}>
              {greeting},
            </p>
            <h2 className="text-3xl font-bold" style={{ color: '#FFFFFF', lineHeight: 1.15 }}>
              {userName}.
            </h2>
          </div>
        </section>

        {/* Primary Action Card - Image-backed */}
        <section className="relative overflow-hidden rounded-[22px] card-shadow-raised">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1768737829317-8458524c7053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmRhbmdlcmVkJTIwd2lsZGxpZmUlMjBjb25zZXJ2YXRpb24lMjBuYXR1cmV8ZW58MXx8fHwxNzcwNTk0MTc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Wildlife conservation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 image-overlay-dark" />
          <div className="relative z-10 p-6 min-h-[280px] flex flex-col justify-end">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              Start a new assessment
            </h3>
            <p className="text-sm mb-6" style={{ color: '#C9CBD6' }}>
              Guided Step 1 → Step 3 workflow with audit-ready outputs.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreateNew}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Assessment
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF'
                }}
              >
                View Step-by-Step Tutorial
              </button>
            </div>
          </div>
        </section>

        {/* Learning Modules Section */}
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>Next Learning Module</h3>
          </div>

          {/* Module Banner Card - Image-backed */}
          <div className="relative overflow-hidden rounded-[22px] card-shadow-raised">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1759429114703-bfe85822d33d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkbGlmZSUyMGxlYXJuaW5nJTIwbmF0dXJlJTIwY29uc2VydmF0aW9ufGVufDF8fHx8MTc3MDYxNDU1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Learning module"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 image-overlay-dark" />
            <div className="relative z-10 p-6 min-h-[240px] flex flex-col justify-end">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {nextModule.title}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {nextModule.subtitle}
              </p>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Progress</span>
                  <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{nextModule.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${nextModule.progress}%`,
                      background: '#FFFFFF'
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStartModule(nextModule.step as 1 | 2 | 3)}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {nextModule.progress === 0 ? 'Start Module' : nextModule.progress >= 100 ? 'Review Module' : 'Continue Module'}
                </button>
                <button
                  onClick={() => onNavigate('library')}
                  className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
                  style={{
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF'
                  }}
                >
                  View all modules
                </button>
              </div>
            </div>
          </div>

          {/* Start Mock Button */}
          <button
            onClick={() => setShowMockEntry(true)}
            className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
            style={{
              background: '#D2110C',
              color: '#FFFFFF'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Start Guided Mock Assessment
            </div>
          </button>
        </section>

        {/* Reference Library - Full Width Card */}
        <section className="relative overflow-hidden rounded-[22px] card-shadow-raised">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1769269431046-533799ab0079?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBiaW9kaXZlcnNpdHklMjBlbmRhbmdlcmVkJTIwc3BlY2llc3xlbnwxfHx8fDE3NzA1OTQxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Reference library"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 image-overlay-dark" />
          <div className="relative z-10 p-6 min-h-[240px] flex flex-col justify-end">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              Reference Library
            </h3>
            <p className="text-sm mb-6" style={{ color: '#C9CBD6' }}>
              Regional rules and definitions you'll use during assessments
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onNavigate('library');
                  setTimeout(() => {
                    const event = new CustomEvent('scrollToRegionModules');
                    window.dispatchEvent(event);
                  }, 100);
                }}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Open Region Modules
              </button>
              <button
                onClick={() => {
                  onNavigate('library');
                  setTimeout(() => {
                    const event = new CustomEvent('openGlossary');
                    window.dispatchEvent(event);
                  }, 100);
                }}
                className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF'
                }}
              >
                Open Glossary
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* New Assessment Modal */}
      {showNewAssessmentModal && (
        <NewAssessmentModal
          onClose={() => setShowNewAssessmentModal(false)}
          onCreate={handleCreateAssessment}
        />
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {/* Mock Entry Modal */}
      {showMockEntry && (
        <MockEntryModal 
          onClose={() => setShowMockEntry(false)} 
          onStartMock={() => {
            setShowMockEntry(false);
            setShowMockAssessment(true);
          }}
        />
      )}

      {/* Mock Assessment */}
      {showMockAssessment && (
        <MockAssessment
          onComplete={() => {
            setShowMockAssessment(false);
            setShowMockCompleteToast(true);
            setTimeout(() => setShowMockCompleteToast(false), 3000);
          }}
          onClose={() => setShowMockAssessment(false)}
        />
      )}

      {/* Mock Complete Toast */}
      {showMockCompleteToast && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-lg animate-slide-down"
          style={{ background: '#10B981', color: '#FFFFFF' }}
        >
          <p className="text-sm font-semibold">✓ Mock complete — you're ready to draft real assessments</p>
        </div>
      )}
    </div>
  );
}

interface NewAssessmentModalProps {
  onClose: () => void;
  onCreate: (taxonName: string, scientificName: string) => void;
}

function NewAssessmentModal({ onClose, onCreate }: NewAssessmentModalProps) {
  const [taxonName, setTaxonName] = useState('');
  const [scientificName, setScientificName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taxonName && scientificName) {
      onCreate(taxonName, scientificName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="rounded-[22px] card-shadow-raised max-w-md w-full p-6 animate-slide-up" style={{ background: '#1A1C22' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#FFFFFF' }}>New Assessment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taxonName" className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
              Common Name
            </label>
            <input
              type="text"
              id="taxonName"
              value={taxonName}
              onChange={(e) => setTaxonName(e.target.value)}
              placeholder="e.g., Mountain Bluebird"
              className="w-full px-4 py-3 rounded-lg transition-all"
              style={{ 
                background: '#14151A',
                border: '1px solid #242632',
                color: '#FFFFFF'
              }}
              required
            />
          </div>
          <div>
            <label htmlFor="scientificName" className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
              Scientific Name
            </label>
            <input
              type="text"
              id="scientificName"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g., Sialia currucoides"
              className="w-full px-4 py-3 rounded-lg italic transition-all"
              style={{ 
                background: '#14151A',
                border: '1px solid #242632',
                color: '#FFFFFF'
              }}
              required
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-3"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TutorialModalProps {
  onClose: () => void;
}

function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 12;

  const tutorialSteps = [
    {
      step: 1,
      title: 'Step 1: Eligibility — Introduction',
      content: 'In Step 1, you decide whether the taxon (and which population) is eligible for a regional assessment. You must confirm the population is within its natural range (or a benign introduction) and that the occurrence is not a vagrant.',
      fields: [
        { label: 'Tutorial taxon', value: 'Mountain Bluebird (Sialia currucoides)' },
        { label: 'Assessment region', value: 'North America (example region profile)' },
        { label: 'Population status', value: 'Native — within natural range' }
      ],
      callout: 'Only wild populations within natural range (and some benign introductions) are eligible for regional assessment. Ineligible taxa should be recorded as NA (Not Applicable), not forced into a threat category.'
    },
    {
      step: 2,
      title: 'Step 1: Eligibility — Wild Population Check',
      content: 'Confirm the individuals in the region represent a wild population (natural reproduction), rather than an introduced or captive-derived occurrence.',
      fields: [
        { label: 'Occurrence type', value: 'Wild population' },
        { label: 'Evidence basis', value: 'Breeding-season records across multiple years (monitoring summaries)' }
      ],
      callout: 'Introduced populations outside natural range are usually NA. You must document why the population qualifies as wild and eligible.'
    },
    {
      step: 3,
      title: 'Step 1: Eligibility — Breeding vs Visiting Populations',
      content: 'Decide whether the taxon occurs as a breeding population, a visiting population, or both. If they can be distinguished, they should be assessed separately.',
      fields: [
        { label: 'Breeding population present in region?', value: 'Yes — confirmed nesting' },
        { label: 'Visiting (non-breeding) population present?', value: 'No' },
        { label: 'Assessment population type', value: 'Breeding population (this tutorial)' }
      ],
      callout: 'Breeding and visiting populations can have different dynamics and risks. Mixing them can invalidate later steps.'
    },
    {
      step: 4,
      title: 'Step 1: Eligibility — Vagrant Check',
      content: 'Verify the taxon is not a vagrant (only occasional accidental occurrences). Vagrants are not assessed.',
      fields: [
        { label: 'Is this a vagrant?', value: 'No' },
        { label: 'Occurrence pattern', value: 'Regular seasonal breeder at established sites' }
      ],
      callout: 'Vagrants have no established regional population to assess and should be recorded as NA.'
    },
    {
      step: 5,
      title: 'Step 1: Eligibility — Recent Colonizer Rule',
      content: 'If the taxon recently colonised the region, it should not be assessed until it has reproduced consistently for several years (policy-dependent).',
      fields: [
        { label: 'Recent colonizer?', value: 'No' },
        { label: 'Continuous reproduction (years)', value: '15+ years documented' },
        { label: 'Decision', value: 'Eligible to assess now' }
      ],
      callout: 'Assessing very newly established populations can misrepresent true risk before the population stabilises.'
    },
    {
      step: 6,
      title: 'Step 1: Eligibility — Optional Regional Filter',
      content: 'Some processes apply a pre-assessment filter (e.g., "assess only if ≥1% of global population occurs in the region"). If a filter is used, it must be documented transparently.',
      fields: [
        { label: 'Filter enabled by authority?', value: 'Yes' },
        { label: 'Filter rule', value: 'Include taxa only if ≥ 1% of global population occurs in region' },
        { label: 'Estimated % global population in region', value: '12% (example)' },
        { label: 'Meets filter?', value: 'Yes → continue assessment' }
      ],
      callout: 'If the taxon fails the filter, it must be recorded as NA with the filter rationale captured.'
    },
    {
      step: 7,
      title: 'Step 1: Eligibility — Step 1 Outcome',
      content: 'Step 1 ends with a clear eligibility outcome. This tutorial proceeds with an eligible breeding population.',
      fields: [
        { label: 'Step 1 outcome', value: 'Eligible — proceed to Step 2' },
        { label: 'Population assessed', value: 'Breeding population only' },
        { label: 'NA/RE assigned?', value: 'No' }
      ],
      callout: 'A clean Step 1 outcome ensures Step 2 is applied to the correct population using correct scope.'
    },
    {
      step: 8,
      title: 'Step 2: Preliminary Category — Regional Data Only',
      content: 'Step 2 applies the IUCN criteria to the regional population. All inputs here describe the regional population (not the global total).',
      fields: [
        { label: 'Data scope confirmation', value: 'Regional population only ✅' },
        { label: 'Assessment basis', value: 'Best-estimate using available evidence + uncertainty ranges' }
      ],
      callout: 'If Step 2 uses global data, the preliminary category is not a valid regional preliminary result.'
    },
    {
      step: 9,
      title: 'Step 2: Preliminary Category — Example Regional Inputs',
      content: 'Here are the kinds of regional inputs recorded for criteria evaluation. In real work, each value must be supported by evidence and methods.',
      fields: [
        { label: 'Regional mature individuals (best estimate)', value: '1,200' },
        { label: 'Uncertainty range', value: '900–1,600' },
        { label: 'Regional EOO (km²)', value: '4,800' },
        { label: 'Regional AOO (km²)', value: '120' },
        { label: 'Number of locations (regional)', value: '6' },
        { label: 'Severe fragmentation suspected?', value: 'No' },
        { label: 'Continuing decline (regional)?', value: 'Yes — habitat quality' },
        { label: 'Primary threat (regional)', value: 'Ongoing habitat degradation (example)' }
      ],
      callout: 'Recording ranges and the reason behind decline improves transparency and reviewer confidence.'
    },
    {
      step: 10,
      title: 'Step 2: Preliminary Category — Preliminary Result (Example)',
      content: 'Using the regional inputs, the system produces a preliminary category and a criteria string (example shown). This is not final until Step 3 is considered.',
      outputFields: [
        { label: 'Preliminary category (Step 2)', value: 'EN (Endangered) — example' },
        { label: 'Criteria string (example)', value: 'B2ab(iii)' },
        { label: 'Data certainty', value: 'Medium' },
        { label: 'Reason summary (locked)', value: 'Restricted AOO with continuing habitat quality decline; multiple locations.' }
      ],
      callout: 'Your Step 2 result is the starting point. Step 3 only changes it when extra-regional populations plausibly reduce or increase extinction risk in the region.'
    },
    {
      step: 11,
      title: 'Step 3: Adjustment — Rescue Effect Check (Breeding Population)',
      content: 'Step 3 considers whether conspecific populations outside the region influence extinction risk inside the region via immigration (rescue effect) or sink dependence.',
      fields: [
        { label: 'Is the regional population isolated?', value: 'No' },
        { label: 'Is immigration of propagules likely?', value: 'Yes — connectivity present' },
        { label: 'Is suitable habitat available for immigrants?', value: 'Yes' },
        { label: 'Are source populations expected to decline?', value: 'No (stable)' },
        { label: 'Adjustment decision', value: 'Downlist by 1 step (example)' }
      ],
      callout: 'Rescue effect typically results in a one-step downlist when immigration is plausible and sources are stable. If influence is unknown, keep Step 2 unchanged.'
    },
    {
      step: 12,
      title: 'Final Output — Best-Estimate (Explained + Transparent)',
      content: 'This is the best-estimate final regional classification after Step 3. Real-world listings require expert review and full documentation.',
      outputFields: [
        { label: 'Final regional category', value: 'VU° (Vulnerable, adjusted) — example' },
        { label: 'Adjusted from Step 2', value: 'Yes' },
        { label: 'Steps changed', value: '1 (downlisted)' },
        { label: 'Final criteria string (example)', value: 'B2ab(iii)' },
        { label: 'Plain-language rationale (locked)', value: 'Within the region, the population has a restricted area of occupancy and ongoing habitat quality decline. However, immigration from stable conspecific populations outside the region is likely and reduces extinction risk within the region. The preliminary category is therefore downlisted by one step as a best-estimate.' },
        { label: 'Confidence (locked)', value: 'Medium' },
        { label: 'Top confidence drivers (locked)', value: '• Regional abundance has uncertainty (900–1,600)\n• Threat mechanism is clear, but trend rate is imprecise\n• Rescue effect plausibility is moderate-to-high' }
      ],
      callout: 'A strong output always shows: the final category, the criteria string, whether adjustment occurred, how many steps changed, and a rationale that can be audited.'
    }
  ];

  const currentTutorialStep = tutorialSteps[currentStep - 1];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="rounded-[22px] card-shadow-raised max-w-2xl w-full max-h-[90vh] overflow-hidden" style={{ background: '#1A1C22' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: '#242632' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Step-by-Step Tutorial</h2>
            <button 
              onClick={onClose}
              className="text-sm font-semibold px-3 py-1 rounded-lg transition-all"
              style={{ color: '#8E91A3' }}
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: '#8E91A3' }}>Step {currentStep} of {totalSteps}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#14151A' }}>
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${(currentStep / totalSteps) * 100}%`,
                  background: '#D2110C'
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {currentTutorialStep?.title || 'Tutorial Step'}
              </h3>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {currentTutorialStep?.content || 'Tutorial content goes here.'}
              </p>
            </div>

            {/* Read-only field example */}
            <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                {currentTutorialStep?.fieldLabel || 'Field Label'}
              </label>
              <div className="w-full px-4 py-3 rounded-lg" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                  {currentTutorialStep?.fieldValue || 'Pre-filled value'}
                </p>
              </div>
            </div>

            {/* Multiple fields example */}
            {currentTutorialStep?.fields && (
              <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
                {currentTutorialStep.fields.map((field, index) => (
                  <div key={index} className="mb-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                      {field.label}
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                      <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                        {field.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Output fields example */}
            {currentTutorialStep?.outputFields && (
              <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
                {currentTutorialStep.outputFields.map((field, index) => (
                  <div key={index} className="mb-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                      {field.label}
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                      <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                        {field.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Callout */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#D2110C' }}>💡 Why This Matters</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {currentTutorialStep?.callout || 'Educational callout goes here.'}
              </p>
            </div>

            {/* Important Callout */}
            {currentTutorialStep?.importantCallout && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#D2110C' }}>⚠️ Important Rule</p>
                <p className="text-sm" style={{ color: '#C9CBD6' }}>
                  {currentTutorialStep.importantCallout}
                </p>
              </div>
            )}

            {/* Tutorial Footer Note */}
            <div className="pt-4 border-t" style={{ borderColor: '#242632' }}>
              <p className="text-xs" style={{ color: '#8E91A3' }}>
                This tutorial is read-only and uses example data to demonstrate the regional 3-step process. It does not guarantee accuracy for real-world assessments.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t" style={{ borderColor: '#242632' }}>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '2px solid #242632',
                color: '#FFFFFF',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (currentStep < totalSteps) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onClose();
                }
              }}
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: '#D2110C',
                color: '#FFFFFF'
              }}
            >
              {currentStep < totalSteps ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MockEntryModalProps {
  onClose: () => void;
  onStartMock: () => void;
}

function MockEntryModal({ onClose, onStartMock }: MockEntryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="rounded-[22px] card-shadow-raised max-w-md w-full p-6 animate-slide-up" style={{ background: '#1A1C22' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Mock Assessment Entry</h2>
        <p className="text-sm mb-6" style={{ color: '#C9CBD6' }}>
          This mock assessment will guide you through the 3-step process using example data. It will help you understand the workflow and the criteria applied.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary py-3"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onStartMock}
            className="flex-1 btn-primary py-3"
          >
            Start Mock
          </button>
        </div>
      </div>
    </div>
  );
}