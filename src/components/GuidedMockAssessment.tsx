import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

interface GuidedMockAssessmentProps {
  onComplete: () => void;
  onClose: () => void;
  onSkip?: () => void; // Optional: called when user clicks "Skip for now"
}

export function GuidedMockAssessment({ onComplete, onClose, onSkip }: GuidedMockAssessmentProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const screens = [
    {
      step: 1,
      stepTitle: 'Step 1: Eligibility',
      screenNumber: 1,
      totalScreens: 7,
      question: 'Is the population native or a benign introduction?',
      lockedSelection: 'Native population',
      lockedDetail: 'Within natural range',
      whyMatters: 'Only eligible wild/natural-range (or benign introduction) populations can be assessed; otherwise record NA.'
    },
    {
      step: 1,
      stepTitle: 'Step 1: Eligibility',
      screenNumber: 2,
      totalScreens: 7,
      question: 'Is this taxon a vagrant in the region?',
      lockedSelection: 'No',
      lockedDetail: 'Established regional population',
      whyMatters: 'Vagrants are not assessed because they are only occasional occurrences.'
    },
    {
      step: 1,
      stepTitle: 'Step 1: Eligibility',
      screenNumber: 3,
      totalScreens: 7,
      question: 'Which population are you assessing?',
      lockedSelection: 'Breeding population',
      lockedDetail: 'Reproduces in region',
      whyMatters: 'Breeding vs visiting populations can require separate assessments when distinguishable.'
    },
    {
      step: 2,
      stepTitle: 'Step 2: Preliminary Category',
      screenNumber: 4,
      totalScreens: 7,
      question: 'Estimated regional population size (mature individuals)?',
      lockedSelection: '~8,000 (example)',
      lockedDetail: 'Range recorded to capture uncertainty',
      whyMatters: 'Step 2 uses regional data only; record uncertainty when needed.'
    },
    {
      step: 2,
      stepTitle: 'Step 2: Preliminary Category',
      screenNumber: 5,
      totalScreens: 7,
      question: 'Regional range and trend summary',
      lockedSelection: 'Multiple values',
      lockedValues: [
        { label: 'Regional AOO', value: '~120 km²' },
        { label: 'Locations', value: '~6' },
        { label: 'Continuing decline', value: 'Yes (habitat quality)' }
      ],
      preliminaryResult: {
        category: 'VU',
        criteriaString: 'B2ab(iii)'
      },
      whyMatters: 'This shows how restricted AOO + continuing decline can drive a preliminary threatened category.'
    },
    {
      step: 3,
      stepTitle: 'Step 3: Adjustment',
      screenNumber: 6,
      totalScreens: 7,
      question: 'Is rescue effect likely from extra-regional populations?',
      lockedSelection: 'Yes',
      lockedDetail: 'Rescue likely (example)',
      adjustmentResult: {
        adjustment: 'Downlist by 1 step',
        finalCategory: 'NT°',
        stepsChanged: 1
      },
      whyMatters: 'If rescue is plausible, category may be downlisted; if influence is unknown, keep Step 2 unchanged.'
    }
  ];

  const screen = screens[currentScreen];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Show results screen
      setCurrentScreen(screens.length);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-lg rounded-[22px] card-shadow-raised overflow-hidden" style={{ background: '#1A1C22' }}>
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: '#242632' }}>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                Guided Mock Assessment
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:bg-white/5"
                style={{ color: '#8E91A3' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-base" style={{ color: '#C9CBD6' }}>
              A read-only walkthrough of the full 3-step regional process
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>What you'll do:</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(96, 165, 250, 0.15)' }}>
                    <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: '#C9CBD6' }}>
                      <strong style={{ color: '#FFFFFF' }}>Step 1:</strong> Confirm eligibility (native/benign intro, vagrant rule, population type)
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(52, 211, 153, 0.15)' }}>
                    <span className="text-xs font-bold" style={{ color: '#34D399' }}>2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: '#C9CBD6' }}>
                      <strong style={{ color: '#FFFFFF' }}>Step 2:</strong> Review regional data inputs and see a preliminary category (example)
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>
                    <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: '#C9CBD6' }}>
                      <strong style={{ color: '#FFFFFF' }}>Step 3:</strong> Apply rescue/sink logic and see how/when adjustment is made (example)
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                <strong style={{ color: '#D2110C' }}>Training only:</strong> All selections are pre-filled and read-only. This is for learning the process flow.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t" style={{ borderColor: '#242632' }}>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowIntro(false)}
                className="btn-primary py-3 flex items-center justify-center gap-2"
              >
                Start Guided Mock
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onSkip || onClose}
                className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
                style={{
                  background: 'transparent',
                  border: '2px solid #242632',
                  color: '#FFFFFF'
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (currentScreen >= screens.length) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm animate-fade-in" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="w-full max-w-lg mx-auto h-full flex flex-col">
          {/* Scrollable Content Region */}
          <div className="flex-1 overflow-y-auto" style={{ 
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '140px'
          }}>
            <div className="p-4 pt-8">
              <div className="rounded-[22px] card-shadow-raised overflow-hidden" style={{ background: '#1A1C22' }}>
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: '#242632' }}>
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                      Guided Mock Complete
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg transition-all hover:bg-white/5"
                      style={{ color: '#8E91A3' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-base" style={{ color: '#C9CBD6' }}>
                    You've walked through all three steps
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Results Summary */}
                  <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#8E91A3' }}>Step 2 Preliminary</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>VU</p>
                        <p className="text-sm" style={{ color: '#8E91A3' }}>B2ab(iii)</p>
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#C9CBD6' }}>Vulnerable (example)</p>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-semibold" style={{ color: '#A78BFA' }}>Step 3 Final (Adjusted)</p>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
                          Adjusted
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>NT°</p>
                        <p className="text-sm" style={{ color: '#8E91A3' }}>B2ab(iii)</p>
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#C9CBD6' }}>Near Threatened (example, adjusted)</p>
                      <div className="pt-3 border-t" style={{ borderColor: 'rgba(167, 139, 250, 0.2)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#A78BFA' }}>Adjustment: Downlist by 1 step</p>
                        <p className="text-xs" style={{ color: '#C9CBD6' }}>
                          Rescue effect from extra-regional populations likely reduces extinction risk in the region
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plain-language rationale */}
                  <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#8E91A3' }}>Plain-language rationale</p>
                    <p className="text-sm" style={{ color: '#C9CBD6' }}>
                      Within the region, the population has a restricted area of occupancy and ongoing habitat quality decline. However, immigration from stable conspecific populations outside the region is likely and reduces extinction risk within the region. The preliminary category is therefore downlisted by one step as a best-estimate.
                    </p>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#34D399' }} />
                      <p className="text-sm" style={{ color: '#C9CBD6' }}>
                        You're now familiar with the full 3-step process. Ready to create your first real assessment?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Bar */}
          <div 
            className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4"
            style={{ 
              background: '#14151A', 
              borderTop: '1px solid #242632',
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'
            }}
          >
            <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
              <button
                onClick={onComplete}
                className="btn-primary py-3"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  setCurrentScreen(0);
                  setShowIntro(true);
                }}
                className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
                style={{
                  background: 'transparent',
                  border: '2px solid #242632',
                  color: '#FFFFFF'
                }}
              >
                Repeat Guided Mock
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question screens
  const stepColors = {
    1: '#60A5FA',
    2: '#34D399',
    3: '#A78BFA'
  };
  const stepColor = stepColors[screen.step as keyof typeof stepColors];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-[22px] card-shadow-raised overflow-hidden" style={{ background: '#1A1C22' }}>
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#242632' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-3 py-1 rounded-full" style={{ background: `${stepColor}20`, border: `1px solid ${stepColor}50` }}>
                  <p className="text-xs font-semibold" style={{ color: stepColor }}>
                    {screen.stepTitle}
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: '#8E91A3' }}>
                Guided Mock Assessment (Training) • Screen {screen.screenNumber} of {screen.totalScreens}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: '#8E91A3' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#14151A' }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${((screen.screenNumber) / screen.totalScreens) * 100}%`,
                background: stepColor
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              {screen.question}
            </h3>
          </div>

          {/* Locked Selection */}
          {screen.lockedValues ? (
            <div className="space-y-3">
              {screen.lockedValues.map((item, index) => (
                <div 
                  key={index}
                  className="rounded-xl p-4"
                  style={{ background: '#14151A', border: `2px solid ${stepColor}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>{item.label}</p>
                      <p className="font-semibold" style={{ color: '#FFFFFF' }}>{item.value}</p>
                    </div>
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: stepColor }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Preliminary Result */}
              {screen.preliminaryResult && (
                <div className="rounded-xl p-4 mt-4" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#34D399' }}>Preliminary Category (Example)</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{screen.preliminaryResult.category}</p>
                    <p className="text-sm" style={{ color: '#8E91A3' }}>{screen.preliminaryResult.criteriaString}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="rounded-xl p-4"
              style={{ background: '#14151A', border: `2px solid ${stepColor}` }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>{screen.lockedSelection}</p>
                  {screen.lockedDetail && (
                    <p className="text-sm" style={{ color: '#8E91A3' }}>{screen.lockedDetail}</p>
                  )}
                </div>
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: stepColor }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </div>
          )}

          {/* Adjustment Result */}
          {screen.adjustmentResult && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#A78BFA' }}>Adjustment Applied</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: '#C9CBD6' }}>Action:</p>
                  <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{screen.adjustmentResult.adjustment}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: '#C9CBD6' }}>Final Category:</p>
                  <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{screen.adjustmentResult.finalCategory}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: '#C9CBD6' }}>Steps Changed:</p>
                  <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{screen.adjustmentResult.stepsChanged}</p>
                </div>
              </div>
            </div>
          )}

          {/* Why This Matters */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#D2110C' }}>Why this matters</p>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>
              {screen.whyMatters}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t" style={{ borderColor: '#242632' }}>
          <div className="flex gap-3">
            {currentScreen > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'transparent',
                  border: '2px solid #242632',
                  color: '#FFFFFF'
                }}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              {currentScreen < screens.length - 1 ? 'Next' : 'View Results'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}