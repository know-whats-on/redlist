import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Info, FileText } from 'lucide-react';

// Step 3 Screen interfaces
interface Step3ScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
  onContinue: () => void;
  onBack: () => void;
  onAddEvidence: (field: string) => void;
}

interface Step3Screen6Props extends Omit<Step3ScreenProps, 'onAddEvidence'> {
  preliminaryCategory: string;
}

interface Step3Screen7Props {
  data: any;
  preliminaryCategory: string;
  criteriaString?: string;
  onContinue: () => void;
  onBack: () => void;
}

interface CompleteScreenProps {
  wizardData: any;
  taxonName: string;
  scientificName: string;
  region: string;
  populationType: string;
  onExport: () => void;
  onReturnToAssessments: () => void;
}

// Bottom Action Bar Component
interface BottomActionBarProps {
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
  backLabel?: string;
  continueLabel?: string;
}

function BottomActionBar({ onBack, onContinue, canContinue, backLabel = 'Back', continueLabel = 'Continue' }: BottomActionBarProps) {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4"
      style={{ 
        background: '#14151A', 
        borderTop: '1px solid #242632',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'
      }}
    >
      <div className="max-w-2xl mx-auto flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-base font-semibold transition-all"
          style={{ background: 'transparent', border: '2px solid #242632', color: '#FFFFFF' }}
        >
          {backLabel}
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
          style={{
            background: canContinue ? '#D2110C' : 'transparent',
            border: `2px solid ${canContinue ? '#D2110C' : '#242632'}`,
            color: canContinue ? '#FFFFFF' : '#8E91A3',
            opacity: canContinue ? 1 : 0.5
          }}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

// STEP 3 SCREEN 1: Extra-regional Context Availability
export function Step3Screen1({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step3ScreenProps) {
  const canContinue = !!data.hasExtraRegionalInfo;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#A78BFA' }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#A78BFA' }}>Step 3 — Adjustment</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                Evaluate whether extra-regional populations affect regional extinction risk via rescue effect or sink dynamics
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Do you have information on conspecific populations outside the region?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            Information about populations beyond the regional boundary is needed to assess potential rescue effects or sink dependence.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ hasExtraRegionalInfo: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.hasExtraRegionalInfo === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.hasExtraRegionalInfo === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.hasExtraRegionalInfo === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.hasExtraRegionalInfo === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Have extra-regional data</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Continue to evaluate isolation, immigration, and source trends
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ hasExtraRegionalInfo: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.hasExtraRegionalInfo === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.hasExtraRegionalInfo === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.hasExtraRegionalInfo === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.hasExtraRegionalInfo === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No / Unknown → No adjustment</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Keep Step 2 category unchanged (best available estimate)
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

// STEP 3 SCREEN 2: Isolation Check
export function Step3Screen2({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step3ScreenProps) {
  const canContinue = !!data.isIsolated;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Is the regional population effectively isolated?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            Isolated or endemic populations cannot receive immigrants from outside the region, so no rescue effect is possible.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ isIsolated: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isIsolated === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isIsolated === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isIsolated === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.isIsolated === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Isolated/endemic → No adjustment</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    No immigration from outside possible
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ isIsolated: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isIsolated === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isIsolated === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isIsolated === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.isIsolated === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No — Part of larger range → Continue</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Immigration may be possible
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

// STEP 3 SCREEN 3: Rescue Effect Likelihood
export function Step3Screen3({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step3ScreenProps) {
  const canContinue = !!data.rescueLikely;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Is immigration of propagules likely and habitat available?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            Rescue effect requires: (1) immigration from extra-regional populations is likely, and (2) suitable habitat exists in the region to receive immigrants.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ rescueLikely: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.rescueLikely === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.rescueLikely === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.rescueLikely === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.rescueLikely === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Rescue plausible</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Immigration likely and habitat available
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ rescueLikely: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.rescueLikely === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.rescueLikely === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.rescueLikely === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.rescueLikely === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No → No adjustment</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Immigration unlikely or no suitable habitat
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ rescueLikely: 'unknown' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.rescueLikely === 'unknown' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.rescueLikely === 'unknown' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.rescueLikely === 'unknown' ? '#D2110C' : '#242632' }}
                >
                  {data.rescueLikely === 'unknown' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Unknown → No adjustment</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Insufficient information to justify downlisting
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

// STEP 3 SCREEN 4: Source Trend
export function Step3Screen4({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step3ScreenProps) {
  const canContinue = !!data.sourceTrendStable;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Are source populations expected to decline?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            If extra-regional source populations are declining, the rescue effect may weaken or disappear. This affects whether downlisting is appropriate.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ sourceTrendStable: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.sourceTrendStable === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.sourceTrendStable === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.sourceTrendStable === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.sourceTrendStable === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No / Stable source populations</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Downlist may be appropriate if rescue is plausible
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ sourceTrendStable: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.sourceTrendStable === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.sourceTrendStable === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.sourceTrendStable === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.sourceTrendStable === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Source declining</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Downlist less likely; consider sink risk instead
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ sourceTrendStable: 'unknown' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.sourceTrendStable === 'unknown' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.sourceTrendStable === 'unknown' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.sourceTrendStable === 'unknown' ? '#D2110C' : '#242632' }}
                >
                  {data.sourceTrendStable === 'unknown' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Unknown</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Uncertainty about source trends
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

// STEP 3 SCREEN 5: Sink Dependence
export function Step3Screen5({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step3ScreenProps) {
  const canContinue = !!data.isSink;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Is the regional population a sink dependent on immigration?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            A sink population cannot persist without continuous immigration from a source. If the source is declining, uplifting (rare) may be considered.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ isSink: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isSink === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isSink === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isSink === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.isSink === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Sink + source declining → Consider uplist (rare)</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Requires strong justification
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ isSink: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isSink === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isSink === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isSink === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.isSink === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No / Unknown → No uplist</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Not a sink scenario
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ isSink: 'unknown' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isSink === 'unknown' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isSink === 'unknown' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isSink === 'unknown' ? '#D2110C' : '#242632' }}
                >
                  {data.isSink === 'unknown' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Unknown</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

// STEP 3 SCREEN 6: Adjustment Decision
export function Step3Screen6({ data, preliminaryCategory, onUpdate, onContinue, onBack }: Step3Screen6Props) {
  const canContinue = !!data.adjustmentType && (data.adjustmentType === 'none' || !!data.adjustmentRationale);

  const calculateFinalCategory = (preliminary: string, adjustment: string) => {
    const hierarchy = ['LC', 'NT', 'VU', 'EN', 'CR'];
    const index = hierarchy.indexOf(preliminary);
    
    if (adjustment === 'downlist-1') {
      return hierarchy[Math.max(0, index - 1)] + '°';
    } else if (adjustment === 'downlist-2') {
      return hierarchy[Math.max(0, index - 2)] + '°';
    } else if (adjustment === 'uplist-1') {
      return hierarchy[Math.min(4, index + 1)] + '°';
    }
    return preliminary;
  };

  const finalCategory = data.adjustmentType ? calculateFinalCategory(preliminaryCategory, data.adjustmentType) : preliminaryCategory;
  
  const getStepsChanged = (adjustment: string) => {
    if (adjustment === 'downlist-1') return -1;
    if (adjustment === 'downlist-2') return -2;
    if (adjustment === 'uplist-1') return 1;
    return 0;
  };

  const handleAdjustmentSelect = (type: string) => {
    const steps = getStepsChanged(type);
    const final = calculateFinalCategory(preliminaryCategory, type);
    onUpdate({ 
      adjustmentType: type, 
      finalCategory: final.replace('°', ''),
      stepsChanged: steps
    });
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Adjustment Decision
          </h2>

          <div className="rounded-lg p-3 mb-6" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
            <p className="text-sm mb-1" style={{ color: '#8E91A3' }}>Step 2 Preliminary:</p>
            <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{preliminaryCategory}</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleAdjustmentSelect('none')}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.adjustmentType === 'none' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.adjustmentType === 'none' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.adjustmentType === 'none' ? '#D2110C' : '#242632' }}
                >
                  {data.adjustmentType === 'none' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No adjustment — Keep {preliminaryCategory}</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Extra-regional context does not justify category change
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleAdjustmentSelect('downlist-1')}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.adjustmentType === 'downlist-1' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.adjustmentType === 'downlist-1' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.adjustmentType === 'downlist-1' ? '#D2110C' : '#242632' }}
                >
                  {data.adjustmentType === 'downlist-1' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Downlist by 1 step (default for rescue)</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Rescue effect likely reduces regional extinction risk
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleAdjustmentSelect('downlist-2')}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.adjustmentType === 'downlist-2' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.adjustmentType === 'downlist-2' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.adjustmentType === 'downlist-2' ? '#D2110C' : '#242632' }}
                >
                  {data.adjustmentType === 'downlist-2' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Downlist by 2 steps (requires explicit justification)</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Strong rescue effect with high confidence
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleAdjustmentSelect('uplist-1')}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.adjustmentType === 'uplist-1' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.adjustmentType === 'uplist-1' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.adjustmentType === 'uplist-1' ? '#D2110C' : '#242632' }}
                >
                  {data.adjustmentType === 'uplist-1' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Uplist by 1 step (rare; sink scenario)</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Sink dependent on declining source; requires strong justification
                  </p>
                </div>
              </div>
            </button>
          </div>

          {data.adjustmentType && data.adjustmentType !== 'none' && (
            <div className="pt-6 border-t" style={{ borderColor: '#242632' }}>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Rationale for adjustment (min 2 sentences) *
              </label>
              <textarea
                value={data.adjustmentRationale || ''}
                onChange={(e) => onUpdate({ adjustmentRationale: e.target.value })}
                placeholder="Explain the reasoning for this adjustment, including evidence of immigration likelihood, habitat availability, source trends, etc..."
                className="w-full px-4 py-3 rounded-lg mb-3 min-h-[120px]"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />

              <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                <p className="text-sm mb-1" style={{ color: '#60A5FA' }}>Projected Final Category:</p>
                <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{finalCategory}</p>
              </div>
            </div>
          )}
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

// STEP 3 SCREEN 7: Final Step 3 Result
export function Step3Screen7({ data, preliminaryCategory, criteriaString, onContinue, onBack }: Step3Screen7Props) {
  const finalCategory = data.finalCategory || preliminaryCategory;
  const isAdjusted = data.adjustmentType && data.adjustmentType !== 'none';
  const stepsChanged = data.stepsChanged || 0;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Step 3 — Final Result
          </h2>

          <div className="space-y-4 mb-6">
            <div className="rounded-lg p-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Step 2 Preliminary:</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>{preliminaryCategory}</p>
              <p className="text-sm" style={{ color: '#8E91A3' }}>{criteriaString || 'Criteria as determined in Step 2'}</p>
            </div>

            <div className="rounded-xl p-6" style={{ 
              background: isAdjusted ? 'rgba(167, 139, 250, 0.1)' : 'rgba(52, 211, 153, 0.1)', 
              border: `1px solid ${isAdjusted ? 'rgba(167, 139, 250, 0.3)' : 'rgba(52, 211, 153, 0.3)'}` 
            }}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold" style={{ color: isAdjusted ? '#A78BFA' : '#34D399' }}>
                  Final Regional Category
                </p>
                {isAdjusted && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#A78BFA' }}>
                    Adjusted
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <p className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
                  {finalCategory}{isAdjusted ? '°' : ''}
                </p>
                <p className="text-base" style={{ color: '#8E91A3' }}>{criteriaString || ''}</p>
              </div>
              
              {isAdjusted && (
                <div className="pt-3 border-t" style={{ borderColor: isAdjusted ? 'rgba(167, 139, 250, 0.2)' : 'rgba(52, 211, 153, 0.2)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#A78BFA' }}>
                    Adjustment: {stepsChanged < 0 ? 'Downlist' : 'Uplist'} by {Math.abs(stepsChanged)} step{Math.abs(stepsChanged) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm" style={{ color: '#C9CBD6' }}>
                    {data.adjustmentRationale}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#60A5FA' }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#60A5FA' }}>Ready for Export</p>
                <p className="text-sm" style={{ color: '#C9CBD6' }}>
                  All three steps complete. Proceed to generate your submission-ready assessment record.
                </p>
              </div>
            </div>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={true}
          continueLabel="View Complete Assessment"
        />
      </div>
    </div>
  );
}

// COMPLETE SCREEN
export function CompleteScreen({ wizardData, taxonName, scientificName, region, populationType, onExport, onReturnToAssessments }: CompleteScreenProps) {
  const finalCategory = wizardData.step3?.finalCategory || wizardData.step2?.preliminaryCategory || 'DD';
  const criteriaString = wizardData.step2?.criteriaString || 'Not determined';
  const isAdjusted = wizardData.step3?.adjustmentType && wizardData.step3.adjustmentType !== 'none';
  const [showFullCriteria, setShowFullCriteria] = useState(false);

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow overflow-hidden mb-6" style={{ background: '#1A1C22' }}>
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: '#242632' }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
              Assessment Complete
            </h2>
            <p className="text-base" style={{ color: '#C9CBD6', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: '1.5' }}>
              {taxonName} — {scientificName}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6" style={{ overflowX: 'hidden' }}>
            {/* Final Category */}
            <div className="rounded-xl p-6" style={{ background: '#14151A', border: '1px solid #242632', overflowX: 'hidden' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#8E91A3' }}>Final Regional Category</p>
              <div className="flex items-baseline gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
                <p className="text-5xl font-bold" style={{ color: '#FFFFFF' }}>
                  {finalCategory}{isAdjusted ? '°' : ''}
                </p>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-lg" 
                    style={{ 
                      color: '#8E91A3', 
                      whiteSpace: showFullCriteria ? 'normal' : 'nowrap',
                      overflow: showFullCriteria ? 'visible' : 'hidden',
                      textOverflow: showFullCriteria ? 'clip' : 'ellipsis',
                      overflowWrap: 'anywhere',
                      lineHeight: '1.5'
                    }}
                  >
                    {criteriaString}
                  </p>
                  {criteriaString.length > 50 && !showFullCriteria && (
                    <button
                      onClick={() => setShowFullCriteria(true)}
                      className="text-sm mt-1"
                      style={{ color: '#60A5FA' }}
                    >
                      View full criteria
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm" style={{ color: '#C9CBD6', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: '1.5' }}>
                {region} • {populationType === 'breeding' ? 'Breeding' : populationType === 'visiting' ? 'Visiting' : 'Combined'} population
              </p>
            </div>

            {/* Steps Summary */}
            <div className="space-y-3">
              <div className="rounded-lg p-4" style={{ background: '#14151A', border: '1px solid #242632', overflowX: 'hidden' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#60A5FA' }}>Step 1 — Eligibility</p>
                <p className="text-sm" style={{ color: '#FFFFFF', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: '1.5' }}>
                  {wizardData.step1?.outcome === 'eligible' ? '✓ Eligible for assessment' : `NA: ${wizardData.step1?.outcomeReason}`}
                </p>
              </div>

              <div className="rounded-lg p-4" style={{ background: '#14151A', border: '1px solid #242632', overflowX: 'hidden' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#34D399' }}>Step 2 — Preliminary Category</p>
                <p className="text-sm mb-1" style={{ color: '#FFFFFF', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: '1.5' }}>
                  {wizardData.step2?.preliminaryCategory || 'DD'} {wizardData.step2?.criteriaString || ''}
                </p>
                <p className="text-xs" style={{ color: '#8E91A3' }}>
                  Data quality: {wizardData.step2?.dataQuality || 'Not assessed'}
                </p>
              </div>

              <div className="rounded-lg p-4" style={{ background: '#14151A', border: '1px solid #242632', overflowX: 'hidden' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#A78BFA' }}>Step 3 — Adjustment</p>
                <p className="text-sm" style={{ color: '#FFFFFF', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  {isAdjusted 
                    ? `Adjusted by ${wizardData.step3.stepsChanged} step(s): ${wizardData.step3.adjustmentRationale || ''}`
                    : 'No adjustment applied'}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', overflowX: 'hidden' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#60A5FA' }}>What's Next?</p>
              <ul className="text-sm space-y-1" style={{ color: '#C9CBD6', lineHeight: '1.5' }}>
                <li>✓ Export assessment record for review</li>
                <li>✓ Share with expert reviewers</li>
                <li>✓ Address any missing data or uncertainty</li>
                <li>✓ Submit for formal publication/listing</li>
              </ul>
            </div>

            <div className="rounded-lg p-3" style={{ background: 'rgba(0, 0, 0, 0.3)', overflowX: 'hidden' }}>
              <p className="text-xs" style={{ color: '#8E91A3', whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: '1.5' }}>
                <strong>Disclaimer:</strong> This is a best-estimate assessment subject to expert review. Always verify criteria interpretation and data quality before formal submission.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4"
          style={{ 
            background: '#14151A', 
            borderTop: '1px solid #242632',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'
          }}
        >
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            <button
              onClick={onExport}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Export for Review
              </div>
            </button>
            <button
              onClick={onReturnToAssessments}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{ background: 'transparent', border: '2px solid #242632', color: '#FFFFFF' }}
            >
              Return to Assessments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}