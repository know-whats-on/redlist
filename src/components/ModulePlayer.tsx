import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ModulePlayerProps {
  moduleId: 1 | 2 | 3;
  onClose: () => void;
  onComplete: () => void;
}

interface ModulePage {
  pageNumber: number;
  heading: string;
  body: string;
  exampleCard?: {
    fields: { label: string; value: string }[];
  };
  quickCheck?: {
    question: string;
    correctAnswer: string;
    wrongFeedback?: string;
  };
  callout?: string;
  importantCallout?: string;
  outputFields?: { label: string; value: string }[];
  finishMessage?: string;
}

export function ModulePlayer({ moduleId, onClose, onComplete }: ModulePlayerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [quickCheckAnswer, setQuickCheckAnswer] = useState<'correct' | 'wrong' | null>(null);

  const moduleData = getModuleData(moduleId);
  const currentPage = moduleData.pages[currentPageIndex];
  const isLastPage = currentPageIndex === moduleData.pages.length - 1;

  // Load progress
  useEffect(() => {
    const stored = localStorage.getItem(`module-${moduleId}-progress`);
    if (stored) {
      const { currentPageIndex: savedIndex } = JSON.parse(stored);
      setCurrentPageIndex(savedIndex);
    }
  }, [moduleId]);

  // Save progress
  const saveProgress = (pageIndex: number) => {
    const progress = {
      currentPageIndex: pageIndex,
      completionPercent: Math.round(((pageIndex + 1) / moduleData.pages.length) * 100),
      lastOpenedAt: new Date().toISOString()
    };
    localStorage.setItem(`module-${moduleId}-progress`, JSON.stringify(progress));
    
    // Update global module progress
    const globalProgress = JSON.parse(localStorage.getItem('moduleProgress') || '{"step1":0,"step2":0,"step3":0}');
    const stepKey = `step${moduleId}` as 'step1' | 'step2' | 'step3';
    globalProgress[stepKey] = progress.completionPercent;
    localStorage.setItem('moduleProgress', JSON.stringify(globalProgress));
  };

  const handleNext = () => {
    if (currentPage.quickCheck && !quickCheckAnswer) {
      setShowQuickCheck(true);
      return;
    }

    if (isLastPage) {
      // Mark as complete
      saveProgress(moduleData.pages.length - 1);
      const globalProgress = JSON.parse(localStorage.getItem('moduleProgress') || '{\"step1\":0,\"step2\":0,\"step3\":0}');
      const stepKey = `step${moduleId}` as 'step1' | 'step2' | 'step3';
      globalProgress[stepKey] = 100;
      localStorage.setItem('moduleProgress', JSON.stringify(globalProgress));
      
      // Dispatch moduleCompleted event for badge system
      const event = new CustomEvent('moduleCompleted', { detail: { moduleId, step: stepKey } });
      window.dispatchEvent(event);
      
      onComplete();
    } else {
      const nextIndex = currentPageIndex + 1;
      setCurrentPageIndex(nextIndex);
      saveProgress(nextIndex);
      setShowQuickCheck(false);
      setQuickCheckAnswer(null);
    }
  };

  const handleBack = () => {
    if (currentPageIndex > 0) {
      const prevIndex = currentPageIndex - 1;
      setCurrentPageIndex(prevIndex);
      setShowQuickCheck(false);
      setQuickCheckAnswer(null);
    }
  };

  const handleQuickCheckAnswer = (isCorrect: boolean) => {
    setQuickCheckAnswer(isCorrect ? 'correct' : 'wrong');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 safe-area-top border-b" style={{ borderColor: '#242632' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{moduleData.title}</h1>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: '#14151A' }}
          >
            <X className="w-5 h-5" style={{ color: '#C9CBD6' }} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#8E91A3' }}>
            Page {currentPageIndex + 1} of {moduleData.pages.length}
          </span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#14151A' }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${((currentPageIndex + 1) / moduleData.pages.length) * 100}%`,
                background: '#D2110C'
              }}
            />
          </div>
        </div>
      </header>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Section Heading */}
          <div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
              {currentPage.heading}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#C9CBD6' }}>
              {currentPage.body}
            </p>
          </div>

          {/* Example Card */}
          {currentPage.exampleCard && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: '#14151A', border: '1px solid #242632' }}>
              <p className="text-xs font-semibold" style={{ color: '#60A5FA' }}>📋 Example (read-only)</p>
              {currentPage.exampleCard.fields.map((field, index) => (
                <div key={index}>
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

          {/* Output Fields */}
          {currentPage.outputFields && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: '#14151A', border: '1px solid #242632' }}>
              <p className="text-xs font-semibold" style={{ color: '#34D399' }}>✓ Output (example)</p>
              {currentPage.outputFields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                    {field.label}
                  </label>
                  <div className="w-full px-4 py-3 rounded-lg" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Important Callout */}
          {currentPage.importantCallout && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.15)', border: '1px solid rgba(210, 17, 12, 0.4)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#D2110C' }}>⚠️ Important Rule</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {currentPage.importantCallout}
              </p>
            </div>
          )}

          {/* Why This Matters Callout */}
          {currentPage.callout && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#D2110C' }}>💡 Why This Matters</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {currentPage.callout}
              </p>
            </div>
          )}

          {/* Quick Check */}
          {currentPage.quickCheck && showQuickCheck && (
            <div className="rounded-xl p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#A78BFA' }}>✓ Quick Check</p>
              <p className="text-base font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                {currentPage.quickCheck.question}
              </p>
              
              {quickCheckAnswer === null && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleQuickCheckAnswer(currentPage.quickCheck!.correctAnswer === 'Yes')}
                    className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
                    style={{
                      background: '#14151A',
                      border: '2px solid #242632',
                      color: '#FFFFFF'
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleQuickCheckAnswer(currentPage.quickCheck!.correctAnswer === 'No')}
                    className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
                    style={{
                      background: '#14151A',
                      border: '2px solid #242632',
                      color: '#FFFFFF'
                    }}
                  >
                    No
                  </button>
                </div>
              )}

              {quickCheckAnswer === 'correct' && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
                    ✓ Correct! {currentPage.quickCheck.correctAnswer}
                  </p>
                </div>
              )}

              {quickCheckAnswer === 'wrong' && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#EF4444' }}>
                    Try again
                  </p>
                  <p className="text-sm" style={{ color: '#C9CBD6' }}>
                    {currentPage.quickCheck.wrongFeedback || `The correct answer is: ${currentPage.quickCheck.correctAnswer}`}
                  </p>
                  <button
                    onClick={() => setQuickCheckAnswer(null)}
                    className="mt-3 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: '#D2110C',
                      color: '#FFFFFF'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Finish Message */}
          {isLastPage && currentPage.finishMessage && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
                🎓 {currentPage.finishMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div 
        className="px-4 py-4 border-t"
        style={{ 
          borderColor: '#242632',
          paddingBottom: 'max(16px, calc(16px + env(safe-area-inset-bottom)))'
        }}
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            disabled={currentPageIndex === 0}
            className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
            style={{
              background: 'transparent',
              border: '2px solid #242632',
              color: '#FFFFFF',
              opacity: currentPageIndex === 0 ? 0.5 : 1
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <ChevronLeft className="w-5 h-5" />
              Back
            </div>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
            style={{
              background: '#D2110C',
              color: '#FFFFFF'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {isLastPage ? 'Finish Module' : 'Next'}
              {!isLastPage && <ChevronRight className="w-5 h-5" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function getModuleData(moduleId: 1 | 2 | 3) {
  const modules = {
    1: {
      title: 'Step 1 — Eligibility',
      pages: [
        {
          pageNumber: 1,
          heading: 'Step 1 decides what can be assessed',
          body: 'Step 1 determines whether a taxon (and which population in your region) is eligible for a regional/national assessment. This prevents invalid cases from being forced into threat categories.',
          quickCheck: {
            question: 'Does Step 1 assign a threat category?',
            correctAnswer: 'No',
            wrongFeedback: 'That\'s Step 2! Step 1 only determines eligibility.'
          }
        },
        {
          pageNumber: 2,
          heading: 'Keep processes separate',
          body: 'Red Listing measures extinction risk. Conservation priority-setting is a different process and must not be mixed into category assignment.',
          quickCheck: {
            question: 'Is "high priority for funding" a Red List category input?',
            correctAnswer: 'No',
            wrongFeedback: 'Correct! Funding priority is separate from extinction risk.'
          }
        },
        {
          pageNumber: 3,
          heading: 'Assess only eligible populations',
          body: 'Regional assessment applies to wild populations in their natural range and certain benign introductions.',
          exampleCard: {
            fields: [
              { label: 'Wild population', value: 'yes' },
              { label: 'Within natural range', value: 'yes' }
            ]
          },
          quickCheck: {
            question: 'Introduced invasive populations are assessed as threatened?',
            correctAnswer: 'No',
            wrongFeedback: 'Correct! Invasive introductions typically receive NA.'
          }
        },
        {
          pageNumber: 4,
          heading: 'Benign introductions are special',
          body: 'A benign introduction is a conservation-driven establishment outside recorded distribution, in suitable habitat/ecogeographical area, usually when historic range is no longer available.',
          exampleCard: {
            fields: [
              { label: 'Example', value: 'Translocation to suitable habitat after habitat loss: benign introduction' }
            ]
          },
          quickCheck: {
            question: 'Benign introductions can be considered eligible if self-sustaining?',
            correctAnswer: 'Yes',
            wrongFeedback: 'Yes, but context-dependent and must be documented.'
          }
        },
        {
          pageNumber: 5,
          heading: 'Identify what occurs in your region',
          body: 'A breeding population reproduces in-region. A visiting population occurs regularly but doesn\'t reproduce in-region.',
          exampleCard: {
            fields: [
              { label: 'Breeding', value: 'confirmed nesting' },
              { label: 'Visiting', value: 'regular wintering only' }
            ]
          },
          quickCheck: {
            question: 'If breeding and visiting are distinguishable, assess separately?',
            correctAnswer: 'Yes'
          }
        },
        {
          pageNumber: 6,
          heading: 'Vagrants cannot be assessed',
          body: 'Vagrants occur only occasionally/accidentally in the region. They are not assessed. Regions must define the boundary between visitors and vagrants (e.g., predictability, % global pop).',
          quickCheck: {
            question: 'A single accidental sighting = visitor?',
            correctAnswer: 'No',
            wrongFeedback: 'No — that\'s a vagrant and receives NA.'
          }
        },
        {
          pageNumber: 7,
          heading: 'Don\'t assess too early',
          body: 'Newly colonising taxa should not be assessed until reproduction in-region is sustained for several years (often ~10 consecutive years, per policy).',
          exampleCard: {
            fields: [
              { label: 'Years of breeding', value: '3 years of breeding: wait' }
            ]
          },
          quickCheck: {
            question: 'Reproduction for 1 year is enough for a new coloniser?',
            correctAnswer: 'No'
          }
        },
        {
          pageNumber: 8,
          heading: 'Filters are allowed (if documented)',
          body: 'Some processes use a pre-filter (e.g., "<1% global population in-region"). If a filter is applied, below-threshold taxa become NA and the decision must be recorded transparently.',
          quickCheck: {
            question: 'If filter excludes a taxon, do we still assign a threat category?',
            correctAnswer: 'No',
            wrongFeedback: 'No — excluded taxa receive NA.'
          }
        },
        {
          pageNumber: 9,
          heading: 'RE is a strong claim',
          body: 'RE means no reasonable doubt the last potentially reproductive individual in the region has disappeared/died. Time limits may be set regionally, but should not normally pre-date 1500 AD.',
          quickCheck: {
            question: 'A few old individuals remain but no breeding: RE?',
            correctAnswer: 'No',
            wrongFeedback: 'Not necessarily—depends; document carefully.'
          }
        },
        {
          pageNumber: 10,
          heading: 'Your Step 1 outcome',
          body: 'Step 1 ends with one of these outcomes: Assess breeding only, Assess visiting only, Assess both separately, NA (Not Applicable), or RE (Regionally Extinct).',
          finishMessage: 'You\'re ready for Step 2: preliminary category using regional data.',
          callout: 'Step 1 is about inclusion/exclusion logic, not threat categories.'
        }
      ] as ModulePage[]
    },
    2: {
      title: 'Step 2 — Preliminary Category',
      pages: [
        {
          pageNumber: 1,
          heading: 'Assign a preliminary category (regional)',
          body: 'Step 2 applies the IUCN Red List criteria to the regional population to produce a preliminary category.',
          importantCallout: 'Regional data only.',
          callout: 'Criteria A–E thresholds and detailed rules come from external IUCN docs; this module trains workflow discipline and inputs.'
        },
        {
          pageNumber: 2,
          heading: 'Do not substitute global estimates',
          body: 'Your population size, trends, AOO/EOO, locations, and fragmentation inputs must describe the regional population. Global values belong only in metadata fields (e.g., global category).',
          quickCheck: {
            question: 'Can you use global population size for Step 2 if regional is unknown?',
            correctAnswer: 'No',
            wrongFeedback: 'Use best regional estimate/uncertainty + document.'
          }
        },
        {
          pageNumber: 3,
          heading: 'Every key number needs support',
          body: 'Before entering values, identify evidence types: surveys, monitoring, expert elicitation, habitat models, published records.',
          exampleCard: {
            fields: [
              { label: 'Example', value: 'EOO from mapped occurrences + method note.' }
            ]
          },
          quickCheck: {
            question: 'Is "I feel it\'s declining" enough without evidence notes?',
            correctAnswer: 'No'
          }
        },
        {
          pageNumber: 4,
          heading: 'Use mature individuals where required',
          body: 'Capture regional estimate, uncertainty range, and basis (count, inference, model).',
          exampleCard: {
            fields: [
              { label: 'Regional mature individuals', value: '1,200 (900–1,600), survey 2024–2025.' }
            ]
          },
          quickCheck: {
            question: 'Should you record uncertainty ranges?',
            correctAnswer: 'Yes',
            wrongFeedback: 'Yes, when uncertain.'
          }
        },
        {
          pageNumber: 5,
          heading: 'Range metrics are regional, method matters',
          body: 'Record how AOO/EOO were calculated and the spatial resolution assumptions.',
          exampleCard: {
            fields: [
              { label: 'AOO', value: '120 km² using 2×2 km grid (example).' }
            ]
          },
          quickCheck: {
            question: 'AOO/EOO should include areas outside the region boundary?',
            correctAnswer: 'No',
            wrongFeedback: 'No, for regional inputs.'
          }
        },
        {
          pageNumber: 6,
          heading: 'Capture risk structure',
          body: 'Record number of locations, severe fragmentation (if applicable), and what threats define locations.',
          quickCheck: {
            question: 'Are "locations" the same as "sites"?',
            correctAnswer: 'No',
            wrongFeedback: 'Not necessarily—locations relate to threat-driven events.'
          }
        },
        {
          pageNumber: 7,
          heading: 'Declines must be described',
          body: 'Record observed/inferred/projected declines and what drives them (habitat loss, exploitation, invasive species, etc.).',
          quickCheck: {
            question: 'Can declines be inferred?',
            correctAnswer: 'Yes',
            wrongFeedback: 'Yes, if justified.'
          }
        },
        {
          pageNumber: 8,
          heading: 'Mechanism matters',
          body: 'Capture major threats, habitat trend, and whether they are ongoing.',
          exampleCard: {
            fields: [
              { label: 'Example', value: 'Habitat quality declining due to land clearing (regional).' }
            ]
          }
        },
        {
          pageNumber: 9,
          heading: 'Step 2 produces a preliminary category',
          body: 'The system compiles your inputs into a preliminary category + criteria string (where supported).',
          callout: 'This is not final until Step 3.'
        },
        {
          pageNumber: 10,
          heading: 'What you still need externally',
          body: 'Detailed criteria thresholds and full rules are from external IUCN docs (Categories & Criteria v3.1 + Using the Criteria).',
          finishMessage: 'Now learn Step 3: adjustment via rescue/sink logic.'
        }
      ] as ModulePage[]
    },
    3: {
      title: 'Step 3 — Adjustment',
      pages: [
        {
          pageNumber: 1,
          heading: 'Adjust preliminary category (if justified)',
          body: 'Step 3 considers conspecific populations outside the region and adjusts the Step 2 category only when extra-regional dynamics plausibly change extinction risk.'
        },
        {
          pageNumber: 2,
          heading: 'Isolated or endemic populations',
          body: 'If the regional population is essentially isolated (or the taxon is endemic to the region), Step 3 usually makes no change.',
          quickCheck: {
            question: 'Endemic taxon → adjust down due to rescue?',
            correctAnswer: 'No'
          }
        },
        {
          pageNumber: 3,
          heading: 'Immigration can reduce extinction risk',
          body: 'If immigration of propagules is likely and habitat allows establishment, extinction risk may be lower than Step 2 suggests.',
          exampleCard: {
            fields: [
              { label: 'Example', value: 'Stable source populations + connectivity → rescue plausible.' }
            ]
          }
        },
        {
          pageNumber: 4,
          heading: 'If uncertain, keep Step 2',
          body: 'If it is unknown whether extra-regional populations will influence extinction risk, keep the Step 2 category unchanged and document the uncertainty.',
          quickCheck: {
            question: 'Unsure about immigration → downlist anyway?',
            correctAnswer: 'No'
          }
        },
        {
          pageNumber: 5,
          heading: 'Usually one step',
          body: 'A rescue effect typically leads to downlisting by one category step. Two-step downlisting is only for specific edge cases and must be justified.',
          quickCheck: {
            question: 'Default downlisting is 3 steps?',
            correctAnswer: 'No'
          }
        },
        {
          pageNumber: 6,
          heading: 'When risk is higher than it looks',
          body: 'Uplisting is rare but can occur if the regional population is a sink and depends on immigration from a source population that is expected to decline.',
          exampleCard: {
            fields: [
              { label: 'Example', value: 'Sink + source declining → risk increases.' }
            ]
          }
        },
        {
          pageNumber: 7,
          heading: 'Don\'t count the same deterioration twice',
          body: 'For visiting taxa, deterioration inside or outside the region should already be accounted for in Step 2. Step 3 adjustments are only made when rescue/extra-regional dynamics genuinely change risk.',
          quickCheck: {
            question: 'Outside-region deterioration → adjust again in Step 3?',
            correctAnswer: 'No',
            wrongFeedback: 'Avoid double-counting.'
          }
        },
        {
          pageNumber: 8,
          heading: 'If you adjust, explain it',
          body: 'Any up/downlisting must include: rationale, evidence links, number of steps changed.',
          quickCheck: {
            question: 'Can you adjust without documenting step change?',
            correctAnswer: 'No'
          }
        },
        {
          pageNumber: 9,
          heading: 'Adjustments must be visible',
          body: 'Adjusted categories should be clearly flagged in outputs (e.g., "adjusted" marker and step change recorded) so reviewers can audit decisions quickly.'
        },
        {
          pageNumber: 10,
          heading: 'You can now draft a complete assessment',
          body: 'You\'ve completed the 3-step regional workflow: 1) Eligibility, 2) Preliminary category (regional data), 3) Adjustment (extra-regional logic).',
          finishMessage: 'You\'re ready to start your first complete regional assessment!'
        }
      ] as ModulePage[]
    }
  };

  return modules[moduleId];
}