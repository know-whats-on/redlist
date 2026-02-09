import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle, TrendingDown, MapPin, Users } from 'lucide-react';
import { AssessmentData } from '../AssessmentWorkflow';

interface Step2PreliminaryProps {
  data: AssessmentData;
  onUpdate: (stepData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Preliminary({ data, onUpdate, onNext, onBack }: Step2PreliminaryProps) {
  const [populationSize, setPopulationSize] = useState(data.step2?.populationSize || '');
  const [populationTrend, setPopulationTrend] = useState(data.step2?.populationTrend || '');
  const [declinePercent, setDeclinePercent] = useState(data.step2?.declinePercent || '');
  const [eoo, setEoo] = useState(data.step2?.eoo || '');
  const [aoo, setAoo] = useState(data.step2?.aoo || '');
  const [locations, setLocations] = useState(data.step2?.locations || '');
  const [severelyFragmented, setSeverelyFragmented] = useState(data.step2?.severelyFragmented || false);
  const [threats, setThreats] = useState(data.step2?.threats || '');

  const [preliminaryCategory, setPreliminaryCategory] = useState(data.step2?.preliminaryCategory || '');
  const [criteriaMet, setCriteriaMet] = useState(data.step2?.criteriaMet || '');
  const [confidence, setConfidence] = useState(data.step2?.confidence || 0);

  useEffect(() => {
    // Auto-calculate preliminary category based on inputs
    const result = calculatePreliminaryCategory({
      populationSize: parseFloat(populationSize) || 0,
      declinePercent: parseFloat(declinePercent) || 0,
      eoo: parseFloat(eoo) || 0,
      aoo: parseFloat(aoo) || 0,
      locations: parseInt(locations) || 0,
      severelyFragmented,
    });
    
    setPreliminaryCategory(result.category);
    setCriteriaMet(result.criteria);
    setConfidence(calculateConfidence({
      populationSize,
      declinePercent,
      eoo,
      aoo,
      locations,
      threats,
    }));
  }, [populationSize, declinePercent, eoo, aoo, locations, severelyFragmented, threats]);

  const handleContinue = () => {
    onUpdate({
      populationSize,
      populationTrend,
      declinePercent,
      eoo,
      aoo,
      locations,
      severelyFragmented,
      threats,
      preliminaryCategory,
      criteriaMet,
      confidence,
    });
    onNext();
  };

  const isComplete = populationSize && declinePercent && threats.trim();

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="rounded-[18px] px-4 py-3" style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
        <h2 className="font-semibold" style={{ color: '#34D399' }}>Step 2: Preliminary Category</h2>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>
          Apply IUCN Criteria to REGIONAL population data
        </p>
      </div>

      {/* Critical Warning */}
      <div className="rounded-[18px] card-shadow p-4 flex items-start gap-3" style={{ background: '#1A1C22', border: '1px solid #B45309' }}>
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#FCD34D' }} />
        <div className="text-sm" style={{ color: '#FCD34D' }}>
          <strong>CRITICAL:</strong> Use only <strong>regional population</strong> data in this step, 
          NOT global data. Global data will be considered in Step 3 for adjustment purposes.
        </div>
      </div>

      {/* Population Size & Trend */}
      <section className="rounded-[18px] card-shadow p-4 space-y-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5" style={{ color: '#60A5FA' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Population Size & Trend</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Regional population size (mature individuals)
          </label>
          <input
            type="number"
            value={populationSize}
            onChange={(e) => setPopulationSize(e.target.value)}
            placeholder="e.g., 8000"
            className="w-full px-4 py-3 rounded-lg"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
          <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
            Enter number of mature (breeding) individuals in the region
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Population trend
          </label>
          <select
            value={populationTrend}
            onChange={(e) => setPopulationTrend(e.target.value)}
            className="w-full px-4 py-3 rounded-lg"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          >
            <option value="">Select trend...</option>
            <option value="increasing">Increasing</option>
            <option value="stable">Stable</option>
            <option value="declining">Declining</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Population decline (% over 10 years or 3 generations)
          </label>
          <input
            type="number"
            value={declinePercent}
            onChange={(e) => setDeclinePercent(e.target.value)}
            placeholder="e.g., 30"
            className="w-full px-4 py-3 rounded-lg"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
          <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
            Enter 0 if stable/increasing
          </p>
        </div>
      </section>

      {/* Geographic Range */}
      <section className="rounded-[18px] card-shadow p-4 space-y-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5" style={{ color: '#60A5FA' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Geographic Range</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Extent of Occurrence (EOO) in km²
          </label>
          <input
            type="number"
            value={eoo}
            onChange={(e) => setEoo(e.target.value)}
            placeholder="e.g., 18000"
            className="w-full px-4 py-3 rounded-lg"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
          <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
            <strong>CR:</strong> {'<'}100 km² | <strong>EN:</strong> {'<'}5,000 km² | <strong>VU:</strong> {'<'}20,000 km²
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Area of Occupancy (AOO) in km²
          </label>
          <input
            type="number"
            value={aoo}
            onChange={(e) => setAoo(e.target.value)}
            placeholder="e.g., 2000"
            className="w-full px-4 py-3 rounded-lg"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
          <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
            <strong>CR:</strong> {'<'}10 km² | <strong>EN:</strong> {'<'}500 km² | <strong>VU:</strong> {'<'}2,000 km²
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Number of locations
          </label>
          <input
            type="number"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="e.g., 5"
            className="w-full px-4 py-3 rounded-lg"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
          <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
            Locations defined by plausible threats (not subpopulations)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="severelyFragmented"
            checked={severelyFragmented}
            onChange={(e) => setSeverelyFragmented(e.target.checked)}
            className="w-5 h-5 rounded"
            style={{ accentColor: '#D2110C' }}
          />
          <label htmlFor="severelyFragmented" className="text-sm" style={{ color: '#C9CBD6' }}>
            Population is severely fragmented
          </label>
        </div>
      </section>

      {/* Threats */}
      <section className="rounded-[18px] card-shadow p-4 space-y-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5" style={{ color: '#60A5FA' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Threats & Evidence</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
            Document threats and evidence for decline
          </label>
          <textarea
            value={threats}
            onChange={(e) => setThreats(e.target.value)}
            placeholder="Describe ongoing threats (e.g., habitat loss, climate change, invasive species) and evidence supporting the decline rate..."
            className="w-full px-4 py-3 rounded-lg min-h-[120px]"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
        </div>
      </section>

      {/* Preliminary Category Result */}
      {preliminaryCategory && (
        <div
          className="rounded-[18px] card-shadow p-4"
          style={{
            background: getCategoryColor(preliminaryCategory).bg,
            border: `2px solid ${getCategoryColor(preliminaryCategory).border}`
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: getCategoryColor(preliminaryCategory).text }}>
            Preliminary Category: {preliminaryCategory}
          </h3>
          <p className="text-sm mb-2" style={{ color: '#C9CBD6' }}>
            <strong>Criteria met:</strong> {criteriaMet || 'None (Data Deficient)'}
          </p>
          <p className="text-sm" style={{ color: '#C9CBD6' }}>
            <strong>Confidence:</strong> {confidence}%
          </p>
          <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
            This is the preliminary category before Step 3 adjustments
          </p>
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
          Continue to Step 3
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function calculatePreliminaryCategory(inputs: any) {
  const { populationSize, declinePercent, eoo, aoo, locations, severelyFragmented } = inputs;

  // Simplified IUCN criteria logic
  let category = 'LC';
  let criteria = '';

  // Criterion A (Population decline)
  if (declinePercent >= 80) {
    category = 'CR';
    criteria = 'A';
  } else if (declinePercent >= 50) {
    category = 'EN';
    criteria = 'A';
  } else if (declinePercent >= 30) {
    category = 'VU';
    criteria = 'A';
  }

  // Criterion B (Geographic range)
  if (eoo < 100 && (locations <= 1 || severelyFragmented)) {
    category = 'CR';
    criteria = criteria ? criteria + ', B' : 'B';
  } else if (eoo < 5000 && (locations <= 5 || severelyFragmented)) {
    if (category !== 'CR') {
      category = 'EN';
      criteria = criteria ? criteria + ', B' : 'B';
    }
  } else if (eoo < 20000 && (locations <= 10 || severelyFragmented)) {
    if (category !== 'CR' && category !== 'EN') {
      category = 'VU';
      criteria = criteria ? criteria + ', B' : 'B';
    }
  }

  // Criterion C (Small population size and decline)
  if (populationSize < 250) {
    category = 'CR';
    criteria = criteria ? criteria + ', C' : 'C';
  } else if (populationSize < 2500 && declinePercent >= 25) {
    if (category !== 'CR') {
      category = 'EN';
      criteria = criteria ? criteria + ', C' : 'C';
    }
  } else if (populationSize < 10000 && declinePercent >= 10) {
    if (category !== 'CR' && category !== 'EN') {
      category = 'VU';
      criteria = criteria ? criteria + ', C' : 'C';
    }
  }

  // If no data, return DD
  if (!populationSize && !declinePercent && !eoo && !aoo) {
    return { category: 'DD', criteria: 'Insufficient data' };
  }

  return { category, criteria: criteria || 'None (Least Concern)' };
}

function calculateConfidence(inputs: any) {
  const { populationSize, declinePercent, eoo, aoo, locations, threats } = inputs;
  
  let score = 0;
  if (populationSize) score += 20;
  if (declinePercent) score += 20;
  if (eoo) score += 15;
  if (aoo) score += 15;
  if (locations) score += 10;
  if (threats && threats.length > 50) score += 20;
  
  return Math.min(100, score);
}

function getCategoryColor(category: string) {
  const colors = {
    CR: { bg: 'rgba(153, 27, 27, 0.2)', border: '#DC2626', text: '#FCA5A5' },
    EN: { bg: 'rgba(194, 65, 12, 0.2)', border: '#EA580C', text: '#FDBA74' },
    VU: { bg: 'rgba(161, 98, 7, 0.2)', border: '#D97706', text: '#FCD34D' },
    NT: { bg: 'rgba(22, 163, 74, 0.2)', border: '#16A34A', text: '#86EFAC' },
    LC: { bg: 'rgba(52, 211, 153, 0.2)', border: '#34D399', text: '#6EE7B7' },
    DD: { bg: 'rgba(142, 145, 163, 0.2)', border: '#8E91A3', text: '#C9CBD6' },
  };
  return colors[category as keyof typeof colors] || colors.LC;
}
