import React, { useState } from 'react';
import { Plus, AlertCircle, Info } from 'lucide-react';

// Step 2 Screen interfaces
interface Step2ScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
  onContinue: () => void;
  onBack: () => void;
  onAddEvidence: (field: string) => void;
}

interface Step2Screen5Props extends Omit<Step2ScreenProps, 'data'> {
  data: any;
  step2Data: any;
}

interface Step2Screen6Props {
  data: any;
  onContinue: () => void;
  onBack: () => void;
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

// STEP 2 SCREEN 1: Evidence Quality & Uncertainty
export function Step2Screen1({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step2ScreenProps) {
  const canContinue = (data.dataSources && data.dataSources.length > 0) && !!data.lastDataYear;

  const dataSourceOptions = [
    { id: 'surveys', label: 'Field surveys' },
    { id: 'monitoring', label: 'Monitoring programs' },
    { id: 'expert', label: 'Expert elicitation' },
    { id: 'literature', label: 'Published literature' },
    { id: 'modelled', label: 'Modelled/estimated data' }
  ];

  const toggleDataSource = (sourceId: string) => {
    const current = data.dataSources || [];
    const updated = current.includes(sourceId)
      ? current.filter((s: string) => s !== sourceId)
      : [...current, sourceId];
    onUpdate({ dataSources: updated });
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* Info Banner */}
        <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#34D399' }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#34D399' }}>Step 2 — Preliminary Category</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                All inputs below describe the <strong>regional population</strong>, not the global population
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Evidence Quality & Uncertainty
          </h2>

          <div className="mb-6">
            <label className="block mb-3 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Data sources (select all that apply) *
            </label>
            <div className="space-y-2">
              {dataSourceOptions.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleDataSource(source.id)}
                  className="w-full p-3 rounded-lg text-left transition-all flex items-center gap-3"
                  style={{
                    background: (data.dataSources || []).includes(source.id) ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                    border: `1px solid ${(data.dataSources || []).includes(source.id) ? '#34D399' : '#242632'}`,
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: (data.dataSources || []).includes(source.id) ? '#34D399' : 'transparent',
                      border: `2px solid ${(data.dataSources || []).includes(source.id) ? '#34D399' : '#242632'}`
                    }}
                  >
                    {(data.dataSources || []).includes(source.id) && (
                      <span style={{ color: '#14151A', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                    )}
                  </div>
                  <span style={{ color: '#FFFFFF' }}>{source.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Last data year *
            </label>
            <input
              type="text"
              value={data.lastDataYear || ''}
              onChange={(e) => onUpdate({ lastDataYear: e.target.value })}
              placeholder="e.g., 2023"
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Uncertainty notes (optional)
            </label>
            <textarea
              value={data.uncertaintyNotes || ''}
              onChange={(e) => onUpdate({ uncertaintyNotes: e.target.value })}
              placeholder="Note any data gaps, uncertainty ranges, or quality issues..."
              className="w-full px-4 py-3 rounded-lg mb-3 min-h-[100px]"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
            <button
              onClick={() => onAddEvidence('dataQualityEvidence')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #242632', color: '#34D399' }}
            >
              <Plus className="w-4 h-4" />
              Add Evidence
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

// STEP 2 SCREEN 2: Population Size (Regional)
export function Step2Screen2({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step2ScreenProps) {
  const canContinue = !!data.trendDirection;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Population Size (Regional)
          </h2>

          <div className="rounded-lg p-3 mb-6" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            <p className="text-xs" style={{ color: '#34D399' }}>
              <strong>Regional data only.</strong> Enter ranges if uncertain (e.g., "1000-5000")
            </p>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Mature individuals — Best estimate
            </label>
            <input
              type="text"
              value={data.matureIndividualsBest || ''}
              onChange={(e) => onUpdate({ matureIndividualsBest: e.target.value })}
              placeholder="e.g., 2500 or 1000-5000"
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Lower bound
              </label>
              <input
                type="text"
                value={data.matureIndividualsLower || ''}
                onChange={(e) => onUpdate({ matureIndividualsLower: e.target.value })}
                placeholder="e.g., 1000"
                className="w-full px-4 py-3 rounded-lg"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Upper bound
              </label>
              <input
                type="text"
                value={data.matureIndividualsUpper || ''}
                onChange={(e) => onUpdate({ matureIndividualsUpper: e.target.value })}
                placeholder="e.g., 5000"
                className="w-full px-4 py-3 rounded-lg"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Trend direction (regional) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['increasing', 'stable', 'decreasing', 'unknown'].map((trend) => (
                <button
                  key={trend}
                  onClick={() => onUpdate({ trendDirection: trend })}
                  className="p-3 rounded-lg text-sm font-semibold transition-all capitalize"
                  style={{
                    background: data.trendDirection === trend ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    border: `2px solid ${data.trendDirection === trend ? '#34D399' : '#242632'}`,
                    color: data.trendDirection === trend ? '#34D399' : '#FFFFFF'
                  }}
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>

          {data.trendDirection === 'decreasing' && (
            <div className="pt-6 border-t" style={{ borderColor: '#242632' }}>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Decline rate (%)
              </label>
              <input
                type="text"
                value={data.declineRate || ''}
                onChange={(e) => onUpdate({ declineRate: e.target.value })}
                placeholder="e.g., 30 or 20-40"
                className="w-full px-4 py-3 rounded-lg mb-3"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />

              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Timeframe
              </label>
              <input
                type="text"
                value={data.declineTimeframe || ''}
                onChange={(e) => onUpdate({ declineTimeframe: e.target.value })}
                placeholder="e.g., 10 years or 3 generations"
                className="w-full px-4 py-3 rounded-lg mb-3"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />

              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Rate type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['observed', 'inferred', 'projected'].map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdate({ declineType: type })}
                    className="p-2 rounded-lg text-xs font-semibold transition-all capitalize"
                    style={{
                      background: data.declineType === type ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                      border: `1px solid ${data.declineType === type ? '#34D399' : '#242632'}`,
                      color: data.declineType === type ? '#34D399' : '#FFFFFF'
                    }}
                  >
                    {type}
                  </button>
                ))}
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

// STEP 2 SCREEN 3: Range & Distribution (Regional)
export function Step2Screen3({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step2ScreenProps) {
  const canContinue = true; // At least some range data attempted

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Range & Distribution (Regional)
          </h2>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Extent of Occurrence (EOO) km²
            </label>
            <input
              type="text"
              value={data.eoo || ''}
              onChange={(e) => onUpdate({ eoo: e.target.value })}
              placeholder="e.g., 5000 or ?"
              className="w-full px-4 py-3 rounded-lg mb-2"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
            <input
              type="text"
              value={data.eooMethod || ''}
              onChange={(e) => onUpdate({ eooMethod: e.target.value })}
              placeholder="Method note (e.g., minimum convex polygon)"
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Area of Occupancy (AOO) km²
            </label>
            <input
              type="text"
              value={data.aoo || ''}
              onChange={(e) => onUpdate({ aoo: e.target.value })}
              placeholder="e.g., 500 or ?"
              className="w-full px-4 py-3 rounded-lg mb-2"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
            <input
              type="text"
              value={data.aooMethod || ''}
              onChange={(e) => onUpdate({ aooMethod: e.target.value })}
              placeholder="Grid method (e.g., 2×2 km grid)"
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Number of locations (regional)
            </label>
            <input
              type="text"
              value={data.numLocations || ''}
              onChange={(e) => onUpdate({ numLocations: e.target.value })}
              placeholder="e.g., 3-5"
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />
            <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
              Location = geographically or ecologically distinct area where single threatening event can rapidly affect all individuals
            </p>
          </div>

          <div>
            <label className="block mb-3 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Severe fragmentation?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => onUpdate({ severFragmentation: option })}
                  className="p-3 rounded-lg text-sm font-semibold transition-all capitalize"
                  style={{
                    background: data.severFragmentation === option ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    border: `2px solid ${data.severFragmentation === option ? '#34D399' : '#242632'}`,
                    color: data.severFragmentation === option ? '#34D399' : '#FFFFFF'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
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

// STEP 2 SCREEN 4: Decline Drivers
export function Step2Screen4({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step2ScreenProps) {
  const canContinue = !!data.habitatQualityTrend;

  const threatOptions = [
    'Habitat loss/degradation',
    'Climate change',
    'Invasive species',
    'Overexploitation',
    'Pollution',
    'Disease',
    'Human disturbance',
    'Other'
  ];

  const toggleThreat = (threat: string) => {
    const current = data.keyThreats || [];
    const updated = current.includes(threat)
      ? current.filter((t: string) => t !== threat)
      : [...current, threat];
    onUpdate({ keyThreats: updated });
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Decline Drivers
          </h2>

          <div className="mb-6">
            <label className="block mb-3 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Habitat quality trend *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['improving', 'stable', 'declining', 'unknown'].map((trend) => (
                <button
                  key={trend}
                  onClick={() => onUpdate({ habitatQualityTrend: trend })}
                  className="p-3 rounded-lg text-sm font-semibold transition-all capitalize"
                  style={{
                    background: data.habitatQualityTrend === trend ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    border: `2px solid ${data.habitatQualityTrend === trend ? '#34D399' : '#242632'}`,
                    color: data.habitatQualityTrend === trend ? '#34D399' : '#FFFFFF'
                  }}
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-3 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Key threats (select all that apply)
            </label>
            <div className="space-y-2">
              {threatOptions.map((threat) => (
                <button
                  key={threat}
                  onClick={() => toggleThreat(threat)}
                  className="w-full p-3 rounded-lg text-left transition-all flex items-center gap-3"
                  style={{
                    background: (data.keyThreats || []).includes(threat) ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                    border: `1px solid ${(data.keyThreats || []).includes(threat) ? '#34D399' : '#242632'}`,
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: (data.keyThreats || []).includes(threat) ? '#34D399' : 'transparent',
                      border: `2px solid ${(data.keyThreats || []).includes(threat) ? '#34D399' : '#242632'}`
                    }}
                  >
                    {(data.keyThreats || []).includes(threat) && (
                      <span style={{ color: '#14151A', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                    )}
                  </div>
                  <span style={{ color: '#FFFFFF' }}>{threat}</span>
                </button>
              ))}
            </div>
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

// STEP 2 SCREEN 5: Criteria Evaluation (A-E) — Assisted
export function Step2Screen5({ data, step2Data, onUpdate, onContinue, onBack }: Step2Screen5Props) {
  const [manualCriteria, setManualCriteria] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Simple criteria evaluation logic (placeholder - real implementation would be more comprehensive)
  const evaluateCriteria = () => {
    const results: string[] = [];
    
    // Criterion B (Geographic range)
    const aoo = parseInt(step2Data.aoo || '0');
    const eoo = parseInt(step2Data.eoo || '0');
    const numLocs = parseInt(step2Data.numLocations || '0');
    
    if (aoo > 0 && aoo < 500) {
      if (numLocs <= 5 && step2Data.habitatQualityTrend === 'declining') {
        results.push('B2ab(iii)');
      }
    }
    
    if (eoo > 0 && eoo < 20000) {
      if (numLocs <= 10 && step2Data.habitatQualityTrend === 'declining') {
        results.push('B1ab(iii)');
      }
    }

    // Criterion A (Population reduction)
    if (step2Data.trendDirection === 'decreasing') {
      const declineRate = parseFloat(step2Data.declineRate || '0');
      if (declineRate >= 50) {
        results.push('A2c');
      } else if (declineRate >= 30) {
        results.push('A2c');
      }
    }

    return results;
  };

  const criteriaResults = evaluateCriteria();
  const canDetermine = criteriaResults.length > 0;

  // Determine category from criteria
  const determineCategory = (criteria: string[]) => {
    if (criteria.some(c => c.includes('B2') && c.includes('ab'))) {
      const aoo = parseInt(step2Data.aoo || '0');
      if (aoo < 10) return 'CR';
      if (aoo < 500) return 'EN';
      if (aoo < 2000) return 'VU';
    }
    if (criteria.some(c => c.includes('A2'))) {
      const rate = parseFloat(step2Data.declineRate || '0');
      if (rate >= 80) return 'CR';
      if (rate >= 50) return 'EN';
      if (rate >= 30) return 'VU';
    }
    return 'DD';
  };

  const preliminaryCategory = canDetermine ? determineCategory(criteriaResults) : (showManualEntry && manualCriteria ? 'VU' : 'DD');
  const criteriaString = canDetermine ? criteriaResults.join('; ') : (showManualEntry && manualCriteria ? manualCriteria : 'Not determined');

  const handleContinue = () => {
    onUpdate({
      preliminaryCategory,
      criteriaString,
      criteriaNotDetermined: !canDetermine && !showManualEntry,
      missingData: canDetermine ? [] : ['Insufficient data for automatic criteria determination'],
      dataQuality: step2Data.dataSources && step2Data.dataSources.length >= 3 ? 'high' : 'medium'
    });
    onContinue();
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Criteria Evaluation (A–E)
          </h2>

          <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
            <div className="flex gap-3">
              <Info className="w-5 h-5 flex-shrink-0" style={{ color: '#60A5FA' }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#60A5FA' }}>Automated Criteria Builder</p>
                <p className="text-sm" style={{ color: '#C9CBD6' }}>
                  Based on your inputs, the app will attempt to compute which IUCN criteria are met
                </p>
              </div>
            </div>
          </div>

          {canDetermine ? (
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#34D399' }}>✓ Criteria Determined</p>
              <p className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {criteriaString}
              </p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                Preliminary category: <strong>{preliminaryCategory}</strong>
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#FBB024' }}>⚠ Insufficient Data</p>
              <p className="text-sm mb-3" style={{ color: '#C9CBD6' }}>
                Cannot deterministically compute criteria string. Missing:
              </p>
              <ul className="text-sm space-y-1 mb-4" style={{ color: '#C9CBD6' }}>
                <li>• Sufficient AOO/EOO data with thresholds</li>
                <li>• Population decline data meeting criteria thresholds</li>
              </ul>
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'transparent', border: '1px solid #FBB024', color: '#FBB024' }}
              >
                {showManualEntry ? 'Hide Manual Entry' : 'Enter Criteria Manually (Optional)'}
              </button>
            </div>
          )}

          {showManualEntry && !canDetermine && (
            <div className="pt-6 border-t mb-6" style={{ borderColor: '#242632' }}>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Manual criteria string entry
              </label>
              <input
                type="text"
                value={manualCriteria}
                onChange={(e) => setManualCriteria(e.target.value)}
                placeholder="e.g., VU B2ab(iii) or DD"
                className="w-full px-4 py-3 rounded-lg"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />
              <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
                Format validation: Category + Criteria (e.g., "EN A2c; B1ab(ii,iii)")
              </p>
            </div>
          )}

          <div className="rounded-lg p-3" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
            <p className="text-xs" style={{ color: '#8E91A3' }}>
              <strong>Best-estimate approach:</strong> This is subject to expert review. If data is insufficient, the category will be DD (Data Deficient) unless you manually enter a justified category.
            </p>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={handleContinue}
          canContinue={true}
        />
      </div>
    </div>
  );
}

// STEP 2 SCREEN 6: Step 2 Result (Review)
export function Step2Screen6({ data, onContinue, onBack }: Step2Screen6Props) {
  const category = data.preliminaryCategory || 'DD';
  const criteriaString = data.criteriaString || 'Not determined';
  const dataQuality = data.dataQuality || 'medium';

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Step 2 — Preliminary Result
          </h2>

          <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#34D399' }}>Preliminary Category</p>
            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>{category}</p>
              <p className="text-base" style={{ color: '#8E91A3' }}>{criteriaString}</p>
            </div>
            
            {category === 'CR' && <p className="text-sm" style={{ color: '#C9CBD6' }}>Critically Endangered (regional preliminary)</p>}
            {category === 'EN' && <p className="text-sm" style={{ color: '#C9CBD6' }}>Endangered (regional preliminary)</p>}
            {category === 'VU' && <p className="text-sm" style={{ color: '#C9CBD6' }}>Vulnerable (regional preliminary)</p>}
            {category === 'NT' && <p className="text-sm" style={{ color: '#C9CBD6' }}>Near Threatened (regional preliminary)</p>}
            {category === 'LC' && <p className="text-sm" style={{ color: '#C9CBD6' }}>Least Concern (regional preliminary)</p>}
            {category === 'DD' && <p className="text-sm" style={{ color: '#C9CBD6' }}>Data Deficient (insufficient data for category determination)</p>}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
              <span className="text-sm" style={{ color: '#8E91A3' }}>Data Quality</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                style={{ 
                  background: dataQuality === 'high' ? 'rgba(52, 211, 153, 0.15)' : dataQuality === 'medium' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: dataQuality === 'high' ? '#34D399' : dataQuality === 'medium' ? '#FBB024' : '#EF4444'
                }}
              >
                {dataQuality}
              </span>
            </div>

            {data.criteriaNotDetermined && (
              <div className="rounded-lg p-3" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#FBB024' }}>⚠ Criteria Not Determined</p>
                <p className="text-xs" style={{ color: '#C9CBD6' }}>
                  Insufficient data for automatic criteria computation. Category marked as DD unless manually justified.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>
              <strong style={{ color: '#60A5FA' }}>Next:</strong> Proceed to Step 3 to consider extra-regional populations and potential category adjustments via rescue effect or sink logic.
            </p>
          </div>
        </div>

        <BottomActionBar
          onBack={onBack}
          onContinue={onContinue}
          canContinue={true}
          continueLabel="Proceed to Step 3"
        />
      </div>
    </div>
  );
}
