import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Lightbulb, CheckCircle } from 'lucide-react';

interface MockAssessmentProps {
  onComplete: () => void;
  onClose: () => void;
}

export function MockAssessment({ onComplete, onClose }: MockAssessmentProps) {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [showSaved, setShowSaved] = useState(false);

  const totalScreens = 7;

  useEffect(() => {
    // Load saved progress
    const saved = localStorage.getItem('mockProgress');
    if (saved) {
      const data = JSON.parse(saved);
      setCurrentScreen(data.currentScreen || 1);
      setChoices(data.choices || {});
    }
  }, []);

  const saveProgress = (screen: number, newChoices: Record<number, string>) => {
    localStorage.setItem('mockProgress', JSON.stringify({
      currentScreen: screen,
      choices: newChoices
    }));
  };

  const handleChoice = (screen: number, choice: string) => {
    const newChoices = { ...choices, [screen]: choice };
    setChoices(newChoices);
    saveProgress(currentScreen, newChoices);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const handleNext = () => {
    if (currentScreen < totalScreens) {
      const nextScreen = currentScreen + 1;
      setCurrentScreen(nextScreen);
      saveProgress(nextScreen, choices);
      window.scrollTo(0, 0);
    } else {
      // Complete mock
      localStorage.setItem('mockCompleted', 'true');
      localStorage.removeItem('mockProgress');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentScreen > 1) {
      const prevScreen = currentScreen - 1;
      setCurrentScreen(prevScreen);
      saveProgress(prevScreen, choices);
      window.scrollTo(0, 0);
    }
  };

  const canContinue = choices[currentScreen] !== undefined || currentScreen === 3 || currentScreen === 7;

  const getStepInfo = () => {
    if (currentScreen <= 3) return { step: 1, label: 'Step 1: Eligibility', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' };
    if (currentScreen <= 5) return { step: 2, label: 'Step 2: Preliminary', color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)' };
    return { step: 3, label: 'Step 3: Adjustment', color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.15)' };
  };

  const stepInfo = getStepInfo();

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4 safe-area-top backdrop-blur-sm bg-black/60" style={{ borderBottom: '1px solid #242632' }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="p-2 -ml-2">
            <X className="w-5 h-5" style={{ color: '#8E91A3' }} />
          </button>
          <span className="text-xs font-semibold" style={{ color: '#8E91A3' }}>
            Screen {currentScreen} of {totalScreens}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#1A1C22' }}>
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${(currentScreen / totalScreens) * 100}%`,
              background: stepInfo.color
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ paddingBottom: '140px' }}>
        {/* Step Pill */}
        {currentScreen !== 7 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1.5 rounded-full" style={{ background: stepInfo.bg }}>
              <span className="text-sm font-semibold" style={{ color: stepInfo.color }}>
                {stepInfo.label}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(142, 145, 163, 0.15)' }}>
              <span className="text-xs font-semibold" style={{ color: '#8E91A3' }}>
                Mock Assessment (Training)
              </span>
            </div>
          </div>
        )}

        {/* Screen 1: Native/Benign/Harmful */}
        {currentScreen === 1 && (
          <Screen1Content choice={choices[1]} onChoice={(c) => handleChoice(1, c)} />
        )}

        {/* Screen 2: Vagrant check */}
        {currentScreen === 2 && (
          <Screen2Content choice={choices[2]} onChoice={(c) => handleChoice(2, c)} />
        )}

        {/* Screen 3: Step 1 Outcome */}
        {currentScreen === 3 && (
          <Screen3Content />
        )}

        {/* Screen 4: Regional population size */}
        {currentScreen === 4 && (
          <Screen4Content choice={choices[4]} onChoice={(c) => handleChoice(4, c)} />
        )}

        {/* Screen 5: Range restriction + decline */}
        {currentScreen === 5 && (
          <Screen5Content choice={choices[5]} onChoice={(c) => handleChoice(5, c)} />
        )}

        {/* Screen 6: Rescue effect */}
        {currentScreen === 6 && (
          <Screen6Content choice={choices[6]} onChoice={(c) => handleChoice(6, c)} />
        )}

        {/* Screen 7: Results */}
        {currentScreen === 7 && (
          <Screen7Content />
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4 safe-area-bottom backdrop-blur-sm bg-black/80" style={{ borderTop: '1px solid #242632' }}>
        <div className="flex gap-3">
          {currentScreen > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '2px solid #242632',
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Back
              </div>
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canContinue}
            className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all disabled:opacity-50"
            style={{
              background: canContinue ? '#D2110C' : '#8E91A3',
              color: '#FFFFFF'
            }}
          >
            {currentScreen === 7 ? 'Start Using the App' : 'Continue'}
          </button>
        </div>
      </div>

      {/* Saved Feedback */}
      {showSaved && (
        <div 
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full shadow-lg animate-slide-down"
          style={{ background: '#10B981', color: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Saved</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Screen 1: Native/Benign/Harmful
function Screen1Content({ choice, onChoice }: { choice?: string; onChoice: (c: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-sm mb-2" style={{ color: '#8E91A3' }}>Mock assessment — Golden Frog</p>
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
          Is the population native or a benign introduction?
        </h2>
      </div>

      <ChoiceCard
        selected={choice === 'native'}
        onSelect={() => onChoice('native')}
        title="Native population"
        subtitle="Within natural range"
        recommended
      />
      
      <ChoiceCard
        selected={choice === 'benign'}
        onSelect={() => onChoice('benign')}
        title="Benign introduction"
        subtitle="Conservation-driven, suitable habitat"
      />
      
      <ChoiceCard
        selected={choice === 'harmful'}
        onSelect={() => onChoice('harmful')}
        title="Harmful introduction"
        subtitle="Cannot assess (NA)"
      />

      <WhyCard>
        Only eligible wild/natural-range (or benign introduction) populations can be assessed. Harmful introductions should be recorded as <strong>NA</strong>, not assigned a threat category.
      </WhyCard>
    </div>
  );
}

// Screen 2: Vagrant check
function Screen2Content({ choice, onChoice }: { choice?: string; onChoice: (c: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
          Is this taxon a vagrant in the region?
        </h2>
      </div>

      <ChoiceCard
        selected={choice === 'no'}
        onSelect={() => onChoice('no')}
        title="No — established breeding population"
        recommended
      />
      
      <ChoiceCard
        selected={choice === 'yes'}
        onSelect={() => onChoice('yes')}
        title="Yes — occasional accidental records (vagrant)"
        subtitle="Teaching branch: this would lead to NA"
      />

      <WhyCard>
        Vagrants are not assessed because they do not represent an established regional population.
      </WhyCard>
    </div>
  );
}

// Screen 3: Step 1 Outcome
function Screen3Content() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
          Step 1 Outcome
        </h2>
        <p className="text-sm" style={{ color: '#C9CBD6' }}>Summary before proceeding to Step 2</p>
      </div>

      <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Eligibility</p>
              <p className="text-base font-bold" style={{ color: '#FFFFFF' }}>Eligible</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: '#60A5FA' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Population type</p>
              <p className="text-base font-bold" style={{ color: '#FFFFFF' }}>Breeding population</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: '#60A5FA' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Next step</p>
              <p className="text-base font-bold" style={{ color: '#FFFFFF' }}>Preliminary category (regional data only)</p>
            </div>
          </div>
        </div>
      </div>

      <WhyCard>
        Step 1 must be clean and explicit so Step 2 applies to the correct regional population.
      </WhyCard>
    </div>
  );
}

// Screen 4: Regional population size
function Screen4Content({ choice, onChoice }: { choice?: string; onChoice: (c: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}>
            Regional data only
          </span>
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
          What is the estimated regional population size (mature individuals)?
        </h2>
      </div>

      <ChoiceCard
        selected={choice === '8000'}
        onSelect={() => onChoice('8000')}
        title="~8,000 mature individuals"
        subtitle="Moderate population size (not automatically threatened by D)"
        recommended
      />
      
      <ChoiceCard
        selected={choice === 'unknown'}
        onSelect={() => onChoice('unknown')}
        title="Unknown"
        subtitle="May lead to DD if key data are missing"
      />
      
      <ChoiceCard
        selected={choice === '<250'}
        onSelect={() => onChoice('<250')}
        title="<250 mature individuals"
        subtitle="Very small population (high risk)"
      />

      <WhyCard>
        Step 2 uses <em>regional</em> estimates. Unknown values increase uncertainty and may prevent assigning a category confidently.
      </WhyCard>
    </div>
  );
}

// Screen 5: Range restriction + decline
function Screen5Content({ choice, onChoice }: { choice?: string; onChoice: (c: string) => void }) {
  const showPreliminary = choice === 'restricted';

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
          Which best describes the regional range and trend?
        </h2>
      </div>

      <ChoiceCard
        selected={choice === 'restricted'}
        onSelect={() => onChoice('restricted')}
        title="Restricted AOO + ongoing habitat quality decline"
        recommended
      />
      
      {choice === 'restricted' && (
        <div className="rounded-xl p-4 ml-4" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#34D399' }}>Example values (read-only)</p>
          <div className="space-y-1.5 text-sm" style={{ color: '#C9CBD6' }}>
            <p>• Regional AOO: <strong>~120 km²</strong></p>
            <p>• Locations: <strong>~6</strong></p>
            <p>• Continuing decline: <strong>Yes (habitat quality)</strong></p>
          </div>
        </div>
      )}
      
      <ChoiceCard
        selected={choice === 'wide'}
        onSelect={() => onChoice('wide')}
        title="Wide range + stable habitat"
      />
      
      <ChoiceCard
        selected={choice === 'unknown-range'}
        onSelect={() => onChoice('unknown-range')}
        title="Unknown / insufficient data"
      />

      {showPreliminary && (
        <div className="rounded-xl p-5" style={{ background: '#14151A', border: '2px solid #34D399' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#34D399' }}>Preliminary result (Step 2)</p>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Preliminary category</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Vulnerable (VU) — example</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Example criteria string (training)</p>
              <p className="text-base font-bold" style={{ color: '#C9CBD6' }}>B2ab(iii)</p>
              <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>AOO restricted + continuing decline in habitat quality</p>
            </div>
          </div>
        </div>
      )}

      <WhyCard>
        This demonstrates how restricted range and continuing decline can produce a threatened preliminary category using regional evidence.
      </WhyCard>
    </div>
  );
}

// Screen 6: Rescue effect
function Screen6Content({ choice, onChoice }: { choice?: string; onChoice: (c: string) => void }) {
  const showAdjustment = choice === 'yes';

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
          Is rescue effect likely from extra-regional conspecific populations?
        </h2>
      </div>

      <ChoiceCard
        selected={choice === 'yes'}
        onSelect={() => onChoice('yes')}
        title="Yes — rescue likely"
        subtitle="Nearby source populations are stable; immigration is plausible"
        recommended
      />
      
      {choice === 'yes' && (
        <div className="rounded-xl p-4 ml-4" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#A78BFA' }}>Prefilled evidence (read-only)</p>
          <div className="space-y-1.5 text-sm" style={{ color: '#C9CBD6' }}>
            <p>• Connectivity: <strong>Present (adjacent habitat corridor)</strong></p>
            <p>• Source populations: <strong>Stable</strong></p>
            <p>• Suitable habitat in region: <strong>Available</strong></p>
          </div>
        </div>
      )}
      
      <ChoiceCard
        selected={choice === 'no'}
        onSelect={() => onChoice('no')}
        title="No — isolated population"
        subtitle="No change from Step 2"
      />
      
      <ChoiceCard
        selected={choice === 'unknown'}
        onSelect={() => onChoice('unknown')}
        title="Unknown"
        subtitle="Keep Step 2 unchanged (do not adjust)"
      />

      {showAdjustment && (
        <div className="rounded-xl p-5" style={{ background: '#14151A', border: '2px solid #A78BFA' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#A78BFA' }}>System adjustment (read-only)</p>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Downlist by 1 step (example)</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>VU → NT</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Mark as adjusted</p>
              <p className="text-base font-bold" style={{ color: '#C9CBD6' }}>NT°</p>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8E91A3' }}>Steps changed</p>
              <p className="text-base font-bold" style={{ color: '#C9CBD6' }}>1</p>
            </div>
          </div>
        </div>
      )}

      <WhyCard>
        Step 3 can reduce extinction risk when immigration is plausible. If influence is unknown, you must keep Step 2 unchanged (no guessing).
      </WhyCard>
    </div>
  );
}

// Screen 7: Results
function Screen7Content() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
          <CheckCircle className="w-8 h-8" style={{ color: '#10B981' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Congratulations!</h1>
        <p className="text-base" style={{ color: '#C9CBD6' }}>You completed your first guided regional assessment</p>
      </div>

      {/* Result Card */}
      <div className="rounded-xl p-6" style={{ background: '#14151A', border: '2px solid #D2110C' }}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Mock taxon</p>
            <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
              Golden Frog <em>(Rana auratus)</em>
            </p>
            <p className="text-xs" style={{ color: '#8E91A3' }}>Training example</p>
          </div>

          <div className="h-px" style={{ background: '#242632' }} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Step 2 (Preliminary)</p>
              <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Vulnerable (VU)</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Step 3 (Final regional)</p>
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>Near Threatened (NT°)</p>
            </div>
          </div>

          <div className="h-px" style={{ background: '#242632' }} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Adjusted?</p>
              <p className="text-base font-bold" style={{ color: '#FFFFFF' }}>Yes</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Steps changed</p>
              <p className="text-base font-bold" style={{ color: '#FFFFFF' }}>1 (downlisted)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale */}
      <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#D2110C' }}>Plain-language rationale</p>
        <p className="text-sm leading-relaxed" style={{ color: '#C9CBD6' }}>
          Within the region, the population shows restricted occupancy and ongoing habitat quality decline, supporting a threatened preliminary category. However, immigration from stable extra-regional populations is likely and suitable habitat remains available, reducing extinction risk within the region. The preliminary category is therefore downlisted by one step as a best-estimate.
        </p>
      </div>

      {/* Confidence */}
      <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Confidence</p>
          <p className="text-base font-bold" style={{ color: '#FFFFFF' }}>Medium</p>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#8E91A3' }}>Drivers</p>
          <div className="space-y-1.5 text-sm" style={{ color: '#C9CBD6' }}>
            <p>• Regional AOO and locations are approximate (example values)</p>
            <p>• Decline mechanism is clear (habitat quality)</p>
            <p>• Rescue effect is plausible due to connectivity and stable sources</p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(142, 145, 163, 0.1)', border: '1px solid rgba(142, 145, 163, 0.3)' }}>
        <p className="text-xs" style={{ color: '#8E91A3' }}>
          This guided mock uses example data to teach the regional 3-step method. It provides a best-estimate demonstration and does not guarantee accuracy for real assessments.
        </p>
      </div>
    </div>
  );
}

// Reusable Components
interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  recommended?: boolean;
}

function ChoiceCard({ selected, onSelect, title, subtitle, badge, recommended }: ChoiceCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-xl p-4 text-left transition-all active:scale-98"
      style={{
        background: selected ? 'rgba(210, 17, 12, 0.1)' : '#14151A',
        border: `2px solid ${selected ? '#D2110C' : '#242632'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center" style={{ borderColor: selected ? '#D2110C' : '#242632' }}>
          {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#D2110C' }} />}
        </div>
        <div className="flex-1">
          <p className="font-bold mb-1" style={{ color: '#FFFFFF' }}>
            {title} {badge && <span className="ml-2">{badge}</span>}
          </p>
          {subtitle && (
            <p className="text-sm" style={{ color: '#8E91A3' }}>{subtitle}</p>
          )}
          {recommended && (
            <p className="text-xs font-semibold mt-1" style={{ color: '#34D399' }}>Recommended</p>
          )}
        </div>
      </div>
    </button>
  );
}

function WhyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 mt-6" style={{ background: 'rgba(210, 17, 12, 0.05)', border: '1px solid rgba(210, 17, 12, 0.2)' }}>
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D2110C' }} />
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: '#D2110C' }}>Why this matters</p>
          <p className="text-sm" style={{ color: '#C9CBD6' }}>{children}</p>
        </div>
      </div>
    </div>
  );
}