import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle } from 'lucide-react';

interface NewAssessmentSetupProps {
  onClose: () => void;
  onComplete: (assessmentId: string, taxonName: string, scientificName: string, region: string, populationType: 'breeding' | 'visiting' | 'combined') => void;
}

export function NewAssessmentSetup({ onClose, onComplete }: NewAssessmentSetupProps) {
  const [currentStep, setCurrentStep] = useState(1); // 1-5
  const [taxonName, setTaxonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [region, setRegion] = useState('');
  const [populationType, setPopulationType] = useState<'breeding' | 'visiting' | 'combined'>('breeding');

  const regions = [
    'North America',
    'Central America',
    'South America',
    'Europe',
    'Africa',
    'Middle East',
    'Central Asia',
    'South Asia',
    'Southeast Asia',
    'East Asia',
    'Australia & New Zealand',
    'Oceania & Pacific Islands',
    'Arctic',
    'Antarctica'
  ];

  const handleComplete = () => {
    const assessmentId = `assessment-${Date.now()}`;
    
    // Save draft to localStorage
    const draft = {
      id: assessmentId,
      taxonName,
      scientificName,
      region,
      populationType,
      status: 'draft',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    const existing = localStorage.getItem('assessments');
    const assessments = existing ? JSON.parse(existing) : [];
    assessments.push(draft);
    localStorage.setItem('assessments', JSON.stringify(assessments));
    
    onComplete(assessmentId, taxonName, scientificName, region, populationType);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <div className="px-4 py-4 safe-area-top" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>New Assessment</h1>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" style={{ color: '#8E91A3' }} />
          </button>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: currentStep >= step ? '#D2110C' : '#242632'
              }}
            />
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>Step {currentStep} of 5</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto">
          {/* Step 1: Taxon Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>What taxon are you assessing?</h2>
                <p className="text-sm" style={{ color: '#8E91A3' }}>Enter the common and scientific names</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                  Common Name *
                </label>
                <input
                  type="text"
                  value={taxonName}
                  onChange={(e) => setTaxonName(e.target.value)}
                  placeholder="e.g., Golden Frog"
                  className="w-full px-4 py-3 rounded-xl text-base"
                  style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                  Scientific Name *
                </label>
                <input
                  type="text"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  placeholder="e.g., Atelopus zeteki"
                  className="w-full px-4 py-3 rounded-xl text-base"
                  style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF', fontStyle: 'italic' }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Region */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Which region?</h2>
                <p className="text-sm" style={{ color: '#8E91A3' }}>Select the geographic region for this assessment</p>
              </div>

              <div className="space-y-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className="w-full p-4 rounded-xl text-left transition-all flex items-center justify-between"
                    style={{
                      background: region === r ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                      border: `1px solid ${region === r ? '#D2110C' : '#242632'}`,
                      color: '#FFFFFF'
                    }}
                  >
                    <span>{r}</span>
                    {region === r && (
                      <CheckCircle className="w-5 h-5" style={{ color: '#D2110C' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Population Type */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Population type?</h2>
                <p className="text-sm" style={{ color: '#8E91A3' }}>Choose how the taxon uses this region</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPopulationType('breeding')}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: populationType === 'breeding' ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: `2px solid ${populationType === 'breeding' ? '#D2110C' : '#242632'}`,
                    color: '#FFFFFF'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ borderColor: populationType === 'breeding' ? '#D2110C' : '#242632' }}
                    >
                      {populationType === 'breeding' && (
                        <div className="w-4 h-4 rounded-full" style={{ background: '#D2110C' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold mb-1">Breeding</p>
                      <p className="text-sm" style={{ color: '#8E91A3' }}>
                        Reproduces within the region (entire or essential part of life cycle)
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPopulationType('visiting')}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: populationType === 'visiting' ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: `2px solid ${populationType === 'visiting' ? '#D2110C' : '#242632'}`,
                    color: '#FFFFFF'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ borderColor: populationType === 'visiting' ? '#D2110C' : '#242632' }}
                    >
                      {populationType === 'visiting' && (
                        <div className="w-4 h-4 rounded-full" style={{ background: '#D2110C' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold mb-1">Visiting</p>
                      <p className="text-sm" style={{ color: '#8E91A3' }}>
                        Present regularly but does not breed in the region (e.g., migratory species)
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPopulationType('combined')}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: populationType === 'combined' ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
                    border: `2px solid ${populationType === 'combined' ? '#D2110C' : '#242632'}`,
                    color: '#FFFFFF'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ borderColor: populationType === 'combined' ? '#D2110C' : '#242632' }}
                    >
                      {populationType === 'combined' && (
                        <div className="w-4 h-4 rounded-full" style={{ background: '#D2110C' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold mb-1">Combined / Unclear</p>
                      <p className="text-sm" style={{ color: '#8E91A3' }}>
                        Cannot distinguish breeding from visiting populations, or both are present
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Review details</h2>
                <p className="text-sm" style={{ color: '#8E91A3' }}>Check that everything is correct before creating your draft</p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: '#1A1C22', border: '1px solid #242632' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Taxon</p>
                  <p className="font-bold" style={{ color: '#FFFFFF' }}>{taxonName}</p>
                  <p className="text-sm italic" style={{ color: '#C9CBD6' }}>{scientificName}</p>
                </div>

                <div className="rounded-xl p-4" style={{ background: '#1A1C22', border: '1px solid #242632' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Region</p>
                  <p className="font-bold" style={{ color: '#FFFFFF' }}>{region}</p>
                </div>

                <div className="rounded-xl p-4" style={{ background: '#1A1C22', border: '1px solid #242632' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Population Type</p>
                  <p className="font-bold capitalize" style={{ color: '#FFFFFF' }}>{populationType}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Draft Created */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(52, 211, 153, 0.15)' }}
                >
                  <CheckCircle className="w-10 h-10" style={{ color: '#34D399' }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Draft Created!</h2>
                <p className="text-sm" style={{ color: '#8E91A3' }}>
                  Your assessment draft is ready. Now begin the guided 3-step IUCN Regional Assessment process.
                </p>
              </div>

              <div className="rounded-xl p-4" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#60A5FA' }}>What's next?</p>
                <ul className="text-sm space-y-1" style={{ color: '#C9CBD6' }}>
                  <li>✓ Step 1 — Determine eligibility</li>
                  <li>✓ Step 2 — Assign preliminary category (regional data only)</li>
                  <li>✓ Step 3 — Adjust via rescue/sink logic</li>
                  <li>✓ Export submission-ready record</li>
                </ul>
              </div>

              <div className="rounded-lg p-3" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                <p className="text-xs" style={{ color: '#8E91A3' }}>
                  <strong>Remember:</strong> All progress autosaves. You can exit anytime and resume later from your Assess list.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div 
        className="px-4 py-4"
        style={{ 
          background: '#14151A', 
          borderTop: '1px solid #242632',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'
        }}
      >
        <div className="max-w-md mx-auto flex gap-3">
          {currentStep > 1 && currentStep < 5 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 rounded-xl text-base font-semibold transition-all"
              style={{ background: 'transparent', border: '2px solid #242632', color: '#FFFFFF' }}
            >
              Back
            </button>
          )}
          {currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && (!taxonName || !scientificName)) ||
                (currentStep === 2 && !region)
              }
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: 
                  (currentStep === 1 && (!taxonName || !scientificName)) ||
                  (currentStep === 2 && !region)
                    ? 'transparent'
                    : '#D2110C',
                border: `2px solid ${
                  (currentStep === 1 && (!taxonName || !scientificName)) ||
                  (currentStep === 2 && !region)
                    ? '#242632'
                    : '#D2110C'
                }`,
                color: 
                  (currentStep === 1 && (!taxonName || !scientificName)) ||
                  (currentStep === 2 && !region)
                    ? '#8E91A3'
                    : '#FFFFFF',
                opacity:
                  (currentStep === 1 && (!taxonName || !scientificName)) ||
                  (currentStep === 2 && !region)
                    ? 0.5
                    : 1
              }}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {currentStep === 4 && (
            <button
              onClick={() => setCurrentStep(5)}
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              Create Draft
            </button>
          )}
          {currentStep === 5 && (
            <button
              onClick={handleComplete}
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              Start Step 1
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
