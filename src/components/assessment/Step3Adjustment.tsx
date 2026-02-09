import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { AssessmentData } from '../AssessmentWorkflow';

interface Step3AdjustmentProps {
  data: AssessmentData;
  onUpdate: (stepData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Adjustment({ data, onUpdate, onNext, onBack }: Step3AdjustmentProps) {
  const [rescueEffect, setRescueEffect] = useState<string | null>(data.step3?.rescueEffect ?? null);
  const [immigrationLikely, setImmigrationLikely] = useState<boolean | null>(data.step3?.immigrationLikely ?? null);
  const [sourceStable, setSourceStable] = useState<boolean | null>(data.step3?.sourceStable ?? null);
  const [isSink, setIsSink] = useState<boolean | null>(data.step3?.isSink ?? null);
  const [adjustmentRationale, setAdjustmentRationale] = useState(data.step3?.adjustmentRationale || '');
  
  const preliminaryCategory = data.step2?.preliminaryCategory || 'LC';
  const [finalCategory, setFinalCategory] = useState(data.step3?.finalCategory || preliminaryCategory);
  const [adjustmentSteps, setAdjustmentSteps] = useState(data.step3?.adjustmentSteps || 0);

  useEffect(() => {
    // Calculate adjustment based on rescue effect logic
    const result = calculateAdjustment({
      preliminaryCategory,
      immigrationLikely,
      sourceStable,
      isSink,
    });
    
    setFinalCategory(result.category);
    setAdjustmentSteps(result.steps);
  }, [preliminaryCategory, immigrationLikely, sourceStable, isSink]);

  const handleContinue = () => {
    onUpdate({
      rescueEffect,
      immigrationLikely,
      sourceStable,
      isSink,
      adjustmentSteps,
      adjustmentRationale,
      finalCategory,
    });
    onNext();
  };

  const isComplete = rescueEffect !== null && adjustmentRationale.trim().length > 0;
  const categoryChanged = finalCategory !== preliminaryCategory;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="rounded-[18px] px-4 py-3" style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
        <h2 className="font-semibold" style={{ color: '#A78BFA' }}>Step 3: Adjustment via Extra-regional Populations</h2>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>
          Consider rescue effect and sink dynamics
        </p>
      </div>

      {/* Current Status */}
      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #60A5FA' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#60A5FA' }}>Preliminary Category (from Step 2)</h3>
        <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{preliminaryCategory}</p>
        {data.step2?.criteriaMet && (
          <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>
            Criteria: {data.step2.criteriaMet}
          </p>
        )}
      </div>

      {/* Important Note */}
      <div className="rounded-[18px] card-shadow p-4 flex items-start gap-3" style={{ background: '#1A1C22', border: '1px solid #B45309' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FCD34D' }} />
        <div className="text-sm" style={{ color: '#FCD34D' }}>
          <strong>Key Principle:</strong> Rescue effect typically results in downlisting (lower risk). 
          Uplisting is rare and only when the regional population is a sink dependent on immigration 
          from sources expected to decrease.
        </div>
      </div>

      {/* Question 1: Rescue Effect */}
      <section className="rounded-[18px] card-shadow p-4 space-y-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>
          Is rescue effect likely from extra-regional populations?
        </h3>
        <p className="text-sm" style={{ color: '#C9CBD6' }}>
          Rescue effect occurs when immigration from populations outside the region increases the 
          viability of the regional population
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              setRescueEffect('yes');
              setImmigrationLikely(null);
              setSourceStable(null);
            }}
            className="w-full px-4 py-4 rounded-lg text-left transition-all"
            style={{
              background: rescueEffect === 'yes' ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
              border: rescueEffect === 'yes' ? '2px solid #D2110C' : '1px solid #242632'
            }}
          >
            <div className="font-semibold" style={{ color: '#FFFFFF' }}>Yes, rescue effect likely</div>
            <div className="text-sm mt-1" style={{ color: '#8E91A3' }}>Immigration probable from stable sources</div>
          </button>

          <button
            onClick={() => {
              setRescueEffect('no');
              setImmigrationLikely(false);
              setSourceStable(false);
              setIsSink(null);
            }}
            className="w-full px-4 py-4 rounded-lg text-left transition-all"
            style={{
              background: rescueEffect === 'no' ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
              border: rescueEffect === 'no' ? '2px solid #D2110C' : '1px solid #242632'
            }}
          >
            <div className="font-semibold" style={{ color: '#FFFFFF' }}>No rescue effect</div>
            <div className="text-sm mt-1" style={{ color: '#8E91A3' }}>Population is isolated or sources unstable</div>
          </button>

          <button
            onClick={() => {
              setRescueEffect('uncertain');
              setImmigrationLikely(null);
              setSourceStable(null);
              setIsSink(null);
            }}
            className="w-full px-4 py-4 rounded-lg text-left transition-all"
            style={{
              background: rescueEffect === 'uncertain' ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
              border: rescueEffect === 'uncertain' ? '2px solid #D2110C' : '1px solid #242632'
            }}
          >
            <div className="font-semibold" style={{ color: '#FFFFFF' }}>Uncertain</div>
            <div className="text-sm mt-1" style={{ color: '#8E91A3' }}>Insufficient information</div>
          </button>
        </div>
      </section>

      {/* Rescue Effect Details */}
      {rescueEffect === 'yes' && (
        <section className="rounded-[18px] card-shadow p-4 space-y-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>
            Immigration and Source Population Details
          </h3>

          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: '#C9CBD6' }}>
              Is immigration of propagules likely?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setImmigrationLikely(true)}
                className="w-full px-4 py-3 rounded-lg text-left transition-all"
                style={{
                  background: immigrationLikely === true ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                  border: immigrationLikely === true ? '2px solid #D2110C' : '1px solid #242632'
                }}
              >
                <div className="font-semibold" style={{ color: '#FFFFFF' }}>Yes, immigration likely</div>
              </button>
              <button
                onClick={() => setImmigrationLikely(false)}
                className="w-full px-4 py-3 rounded-lg text-left transition-all"
                style={{
                  background: immigrationLikely === false ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                  border: immigrationLikely === false ? '2px solid #D2110C' : '1px solid #242632'
                }}
              >
                <div className="font-semibold" style={{ color: '#FFFFFF' }}>No, immigration unlikely</div>
              </button>
            </div>
          </div>

          {immigrationLikely !== null && (
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: '#C9CBD6' }}>
                Are source populations stable or increasing?
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setSourceStable(true)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    background: sourceStable === true ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: sourceStable === true ? '2px solid #D2110C' : '1px solid #242632'
                  }}
                >
                  <div className="font-semibold" style={{ color: '#FFFFFF' }}>Yes, sources stable/increasing</div>
                </button>
                <button
                  onClick={() => setSourceStable(false)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    background: sourceStable === false ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: sourceStable === false ? '2px solid #D2110C' : '1px solid #242632'
                  }}
                >
                  <div className="font-semibold" style={{ color: '#FFFFFF' }}>No, sources declining</div>
                </button>
              </div>
            </div>
          )}

          {immigrationLikely === true && sourceStable === true && (
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: '#C9CBD6' }}>
                Is the regional population a demographic sink?
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setIsSink(false)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    background: isSink === false ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: isSink === false ? '2px solid #D2110C' : '1px solid #242632'
                  }}
                >
                  <div className="font-semibold" style={{ color: '#FFFFFF' }}>No, not a sink</div>
                </button>
                <button
                  onClick={() => setIsSink(true)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    background: isSink === true ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: isSink === true ? '2px solid #D2110C' : '1px solid #242632'
                  }}
                >
                  <div className="font-semibold" style={{ color: '#FFFFFF' }}>Yes, demographic sink</div>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Rationale */}
      {rescueEffect !== null && (
        <section className="rounded-[18px] card-shadow p-4 space-y-3" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <label className="block text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            Adjustment Rationale & Evidence
          </label>
          <textarea
            value={adjustmentRationale}
            onChange={(e) => setAdjustmentRationale(e.target.value)}
            placeholder="Document the evidence and reasoning for adjustment (or no adjustment), including connectivity, source population status, and any sink dynamics..."
            className="w-full px-4 py-3 rounded-lg min-h-[120px]"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
        </section>
      )}

      {/* Adjustment Result */}
      {rescueEffect !== null && (
        <div
          className="rounded-[18px] card-shadow p-4"
          style={{
            background: categoryChanged ? 'rgba(167, 139, 250, 0.15)' : 'rgba(142, 145, 163, 0.1)',
            border: categoryChanged ? '2px solid #A78BFA' : '2px solid #8E91A3'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Final Regional Category</h3>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {categoryChanged ? 'Category adjusted' : 'No adjustment applied'}
              </p>
            </div>
            {categoryChanged && adjustmentSteps !== 0 && (
              <div className="flex items-center gap-2">
                {adjustmentSteps > 0 ? (
                  <ArrowDown className="w-6 h-6" style={{ color: '#10B981' }} />
                ) : (
                  <ArrowUp className="w-6 h-6" style={{ color: '#EF4444' }} />
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
              {finalCategory}{categoryChanged ? '°' : ''}
            </p>
            {categoryChanged && (
              <p className="text-sm" style={{ color: '#8E91A3' }}>
                (was {preliminaryCategory})
              </p>
            )}
          </div>
          
          {categoryChanged && (
            <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
              ° Category notation indicates adjustment from preliminary category
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isComplete}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
        >
          Continue to Output
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function calculateAdjustment(inputs: any) {
  const { preliminaryCategory, immigrationLikely, sourceStable, isSink } = inputs;

  const categoryOrder = ['CR', 'EN', 'VU', 'NT', 'LC'];
  const currentIndex = categoryOrder.indexOf(preliminaryCategory);

  if (currentIndex === -1) return { category: preliminaryCategory, steps: 0 };

  // Rescue effect logic: downlist by 1 category if rescue is likely
  if (immigrationLikely === true && sourceStable === true && isSink === false) {
    const newIndex = Math.min(currentIndex + 1, categoryOrder.length - 1);
    return {
      category: categoryOrder[newIndex],
      steps: 1 // downlisted
    };
  }

  // Sink dynamics: uplist by 1 category if sink with declining sources
  if (isSink === true && sourceStable === false) {
    const newIndex = Math.max(currentIndex - 1, 0);
    return {
      category: categoryOrder[newIndex],
      steps: -1 // uplisted
    };
  }

  // No adjustment
  return { category: preliminaryCategory, steps: 0 };
}
