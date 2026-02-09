import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Plus, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Step2Screen1, Step2Screen2, Step2Screen3, Step2Screen4, Step2Screen5, Step2Screen6 } from './AssessmentWizardStep2';
import { Step3Screen1, Step3Screen2, Step3Screen3, Step3Screen4, Step3Screen5, Step3Screen6, Step3Screen7, CompleteScreen } from './AssessmentWizardStep3';

interface AssessmentWizardProps {
  assessmentId: string;
  taxonName: string;
  scientificName: string;
  region: string;
  populationType: 'breeding' | 'visiting' | 'combined';
  onClose: () => void;
  onComplete: () => void;
}

interface WizardData {
  step1: {
    populationStatus?: 'native' | 'benign-introduction' | 'harmful-introduction';
    populationStatusBasis?: string;
    populationStatusEvidence?: string[];
    isVagrant?: 'no' | 'yes';
    isRecentColoniser?: 'no' | 'yes-under-10' | 'yes-over-10';
    canDistinguishBreedingVisiting?: 'yes' | 'no';
    meetsFilter?: 'yes' | 'no';
    globalPopPercent?: string;
    filterMethod?: string;
    outcome?: 'eligible' | 'NA' | 'RE';
    outcomeReason?: string;
  };
  step2: {
    dataSources?: string[];
    lastDataYear?: string;
    uncertaintyNotes?: string;
    matureIndividualsBest?: string;
    matureIndividualsLower?: string;
    matureIndividualsUpper?: string;
    trendDirection?: 'increasing' | 'stable' | 'decreasing' | 'unknown';
    declineRate?: string;
    declineTimeframe?: string;
    declineType?: 'observed' | 'inferred' | 'projected';
    eoo?: string;
    eooMethod?: string;
    aoo?: string;
    aooMethod?: string;
    numLocations?: string;
    severFragmentation?: 'yes' | 'no';
    habitatQualityTrend?: 'improving' | 'stable' | 'declining' | 'unknown';
    keyThreats?: string[];
    preliminaryCategory?: string;
    criteriaString?: string;
    criteriaNotDetermined?: boolean;
    missingData?: string[];
    dataQuality?: 'low' | 'medium' | 'high';
  };
  step3: {
    hasExtraRegionalInfo?: 'yes' | 'no';
    isIsolated?: 'yes' | 'no';
    rescueLikely?: 'yes' | 'no' | 'unknown';
    sourceTrendStable?: 'yes' | 'no' | 'unknown';
    isSink?: 'yes' | 'no' | 'unknown';
    adjustmentType?: 'downlist-1' | 'downlist-2' | 'uplist-1' | 'none';
    adjustmentRationale?: string;
    adjustmentEvidence?: string[];
    finalCategory?: string;
    stepsChanged?: number;
  };
  currentStep: 'step1' | 'step2' | 'step3' | 'complete';
  currentSubStep: number;
  lastModified: string;
}

export function AssessmentWizard({
  assessmentId,
  taxonName,
  scientificName,
  region,
  populationType,
  onClose,
  onComplete
}: AssessmentWizardProps) {
  const [wizardData, setWizardData] = useState<WizardData>(() => {
    // Load from localStorage if exists
    const stored = localStorage.getItem(`wizard_${assessmentId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      step1: {},
      step2: {},
      step3: {},
      currentStep: 'step1',
      currentSubStep: 1,
      lastModified: new Date().toISOString()
    };
  });

  const [showEvidenceSheet, setShowEvidenceSheet] = useState(false);
  const [currentEvidenceField, setCurrentEvidenceField] = useState<string>('');

  // Autosave on every change
  useEffect(() => {
    const updated = { ...wizardData, lastModified: new Date().toISOString() };
    localStorage.setItem(`wizard_${assessmentId}`, JSON.stringify(updated));
  }, [wizardData, assessmentId]);

  // Mark assessment as completed when reaching the complete screen
  useEffect(() => {
    if (wizardData.currentStep === 'complete') {
      const finalCategory = wizardData.step3?.finalCategory || wizardData.step2?.preliminaryCategory || 'DD';
      const criteriaString = wizardData.step2?.criteriaString || 'Not determined';
      const isAdjusted = !!(wizardData.step3?.adjustmentType && wizardData.step3.adjustmentType !== 'none');
      const stepsChanged = wizardData.step3?.stepsChanged || 0;

      // Update assessment in localStorage
      const stored = localStorage.getItem('assessments');
      const assessments = stored ? JSON.parse(stored) : [];
      const assessmentIndex = assessments.findIndex((a: any) => a.id === assessmentId);
      
      if (assessmentIndex !== -1) {
        // Only update if not already marked as completed
        if (assessments[assessmentIndex].status !== 'completed') {
          assessments[assessmentIndex] = {
            ...assessments[assessmentIndex],
            status: 'completed',
            completedAt: new Date().toISOString(),
            finalCategory,
            criteriaString,
            adjusted: isAdjusted,
            stepsChanged,
            currentStep: 4,
            lastModified: new Date().toISOString()
          };
          localStorage.setItem('assessments', JSON.stringify(assessments));
          
          // Trigger assessment list update
          window.dispatchEvent(new CustomEvent('assessmentCompleted', { detail: { assessmentId } }));
          
          toast.success('Assessment completed!');
        }
      }
    }
  }, [wizardData.currentStep, assessmentId, wizardData.step2, wizardData.step3]);

  const updateStep1 = (updates: Partial<WizardData['step1']>) => {
    setWizardData(prev => ({
      ...prev,
      step1: { ...prev.step1, ...updates }
    }));
  };

  const updateStep2 = (updates: Partial<WizardData['step2']>) => {
    setWizardData(prev => ({
      ...prev,
      step2: { ...prev.step2, ...updates }
    }));
  };

  const updateStep3 = (updates: Partial<WizardData['step3']>) => {
    setWizardData(prev => ({
      ...prev,
      step3: { ...prev.step3, ...updates }
    }));
  };

  const goToSubStep = (step: 'step1' | 'step2' | 'step3', subStep: number) => {
    setWizardData(prev => ({
      ...prev,
      currentStep: step,
      currentSubStep: subStep
    }));
  };

  const handleSaveAndExit = () => {
    toast.success('Progress saved');
    setTimeout(() => onClose(), 300);
  };

  const addEvidence = (field: string) => {
    setCurrentEvidenceField(field);
    setShowEvidenceSheet(true);
  };

  const getProgressPercentage = () => {
    const step1Total = 6;
    const step2Total = 6;
    const step3Total = 7;
    const totalSteps = step1Total + step2Total + step3Total;

    let completedSteps = 0;
    if (wizardData.currentStep === 'step1') {
      completedSteps = wizardData.currentSubStep - 1;
    } else if (wizardData.currentStep === 'step2') {
      completedSteps = step1Total + (wizardData.currentSubStep - 1);
    } else if (wizardData.currentStep === 'step3') {
      completedSteps = step1Total + step2Total + (wizardData.currentSubStep - 1);
    } else if (wizardData.currentStep === 'complete') {
      completedSteps = totalSteps;
    }

    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getStepLabel = () => {
    if (wizardData.currentStep === 'step1') return `Step 1 — Screen ${wizardData.currentSubStep} of 6`;
    if (wizardData.currentStep === 'step2') return `Step 2 — Screen ${wizardData.currentSubStep} of 6`;
    if (wizardData.currentStep === 'step3') return `Step 3 — Screen ${wizardData.currentSubStep} of 7`;
    return 'Complete';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="px-4 py-4 safe-area-top" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{taxonName}</h1>
            <p className="text-sm" style={{ color: '#8E91A3', fontStyle: 'italic' }}>{scientificName}</p>
          </div>
          <button
            onClick={handleSaveAndExit}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'transparent', border: '1px solid #242632', color: '#FFFFFF' }}
          >
            Save & Exit
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
            {region}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
            {populationType === 'breeding' ? 'Breeding' : populationType === 'visiting' ? 'Visiting' : 'Combined'}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}>
            ● Autosave On
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: '#C9CBD6' }}>{getStepLabel()}</span>
            <span className="text-xs font-semibold" style={{ color: '#D2110C' }}>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1A1C22' }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%`, background: '#D2110C' }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', paddingBottom: '140px' }}>
        {/* STEP 1 SCREENS */}
        {wizardData.currentStep === 'step1' && wizardData.currentSubStep === 1 && (
          <Step1Screen1
            data={wizardData.step1}
            onUpdate={updateStep1}
            onContinue={() => goToSubStep('step1', 2)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step1' && wizardData.currentSubStep === 2 && (
          <Step1Screen2
            data={wizardData.step1}
            onUpdate={updateStep1}
            onContinue={() => goToSubStep('step1', 3)}
            onBack={() => goToSubStep('step1', 1)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step1' && wizardData.currentSubStep === 3 && (
          <Step1Screen3
            data={wizardData.step1}
            onUpdate={updateStep1}
            onContinue={() => {
              // Branch based on coloniser status
              if (wizardData.step1.isRecentColoniser === 'yes-under-10') {
                // Go to outcome (NA)
                updateStep1({ outcome: 'NA', outcomeReason: 'Recent coloniser with <10 years reproduction' });
                goToSubStep('step1', 6);
              } else {
                goToSubStep('step1', 4);
              }
            }}
            onBack={() => goToSubStep('step1', 2)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step1' && wizardData.currentSubStep === 4 && (
          <Step1Screen4
            data={wizardData.step1}
            populationType={populationType}
            onUpdate={updateStep1}
            onContinue={() => {
              // Check if filter is enabled for region
              const filterEnabled = checkIfRegionHasFilter(region);
              if (filterEnabled) {
                goToSubStep('step1', 5);
              } else {
                // Skip filter, go to outcome
                updateStep1({ outcome: 'eligible' });
                goToSubStep('step1', 6);
              }
            }}
            onBack={() => goToSubStep('step1', 3)}
          />
        )}

        {wizardData.currentStep === 'step1' && wizardData.currentSubStep === 5 && (
          <Step1Screen5
            data={wizardData.step1}
            region={region}
            onUpdate={updateStep1}
            onContinue={() => {
              if (wizardData.step1.meetsFilter === 'no') {
                updateStep1({ outcome: 'NA', outcomeReason: 'Does not meet regional inclusion filter' });
              } else {
                updateStep1({ outcome: 'eligible' });
              }
              goToSubStep('step1', 6);
            }}
            onBack={() => goToSubStep('step1', 4)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step1' && wizardData.currentSubStep === 6 && (
          <Step1Screen6
            data={wizardData.step1}
            onContinue={() => {
              if (wizardData.step1.outcome === 'eligible') {
                goToSubStep('step2', 1);
              } else {
                // NA or RE - go to final output
                setWizardData(prev => ({ ...prev, currentStep: 'complete' }));
              }
            }}
            onBack={() => {
              // Determine which screen to go back to based on region filter
              const filterEnabled = checkIfRegionHasFilter(region);
              if (filterEnabled) {
                goToSubStep('step1', 5);
              } else {
                goToSubStep('step1', 4);
              }
            }}
            onExportNA={handleExportNA}
          />
        )}

        {/* STEP 2 SCREENS */}
        {wizardData.currentStep === 'step2' && wizardData.currentSubStep === 1 && (
          <Step2Screen1
            data={wizardData.step2}
            onUpdate={updateStep2}
            onContinue={() => goToSubStep('step2', 2)}
            onBack={() => goToSubStep('step1', 6)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step2' && wizardData.currentSubStep === 2 && (
          <Step2Screen2
            data={wizardData.step2}
            onUpdate={updateStep2}
            onContinue={() => goToSubStep('step2', 3)}
            onBack={() => goToSubStep('step2', 1)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step2' && wizardData.currentSubStep === 3 && (
          <Step2Screen3
            data={wizardData.step2}
            onUpdate={updateStep2}
            onContinue={() => goToSubStep('step2', 4)}
            onBack={() => goToSubStep('step2', 2)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step2' && wizardData.currentSubStep === 4 && (
          <Step2Screen4
            data={wizardData.step2}
            onUpdate={updateStep2}
            onContinue={() => goToSubStep('step2', 5)}
            onBack={() => goToSubStep('step2', 3)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step2' && wizardData.currentSubStep === 5 && (
          <Step2Screen5
            data={wizardData.step2}
            step2Data={wizardData.step2}
            onUpdate={updateStep2}
            onContinue={() => goToSubStep('step2', 6)}
            onBack={() => goToSubStep('step2', 4)}
          />
        )}

        {wizardData.currentStep === 'step2' && wizardData.currentSubStep === 6 && (
          <Step2Screen6
            data={wizardData.step2}
            onContinue={() => goToSubStep('step3', 1)}
            onBack={() => goToSubStep('step2', 5)}
          />
        )}

        {/* STEP 3 SCREENS */}
        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 1 && (
          <Step3Screen1
            data={wizardData.step3}
            onUpdate={updateStep3}
            onContinue={() => {
              if (wizardData.step3.hasExtraRegionalInfo === 'no') {
                // No adjustment - keep Step 2 category
                updateStep3({ 
                  adjustmentType: 'none',
                  finalCategory: wizardData.step2.preliminaryCategory,
                  stepsChanged: 0
                });
                goToSubStep('step3', 7);
              } else {
                goToSubStep('step3', 2);
              }
            }}
            onBack={() => goToSubStep('step2', 6)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 2 && (
          <Step3Screen2
            data={wizardData.step3}
            onUpdate={updateStep3}
            onContinue={() => {
              if (wizardData.step3.isIsolated === 'yes') {
                // No adjustment - isolated
                updateStep3({ 
                  adjustmentType: 'none',
                  finalCategory: wizardData.step2.preliminaryCategory,
                  stepsChanged: 0
                });
                goToSubStep('step3', 7);
              } else {
                goToSubStep('step3', 3);
              }
            }}
            onBack={() => goToSubStep('step3', 1)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 3 && (
          <Step3Screen3
            data={wizardData.step3}
            onUpdate={updateStep3}
            onContinue={() => {
              if (wizardData.step3.rescueLikely !== 'yes') {
                // No rescue - no adjustment
                updateStep3({ 
                  adjustmentType: 'none',
                  finalCategory: wizardData.step2.preliminaryCategory,
                  stepsChanged: 0
                });
                goToSubStep('step3', 7);
              } else {
                goToSubStep('step3', 4);
              }
            }}
            onBack={() => goToSubStep('step3', 2)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 4 && (
          <Step3Screen4
            data={wizardData.step3}
            onUpdate={updateStep3}
            onContinue={() => goToSubStep('step3', 5)}
            onBack={() => goToSubStep('step3', 3)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 5 && (
          <Step3Screen5
            data={wizardData.step3}
            onUpdate={updateStep3}
            onContinue={() => goToSubStep('step3', 6)}
            onBack={() => goToSubStep('step3', 4)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 6 && (
          <Step3Screen6
            data={wizardData.step3}
            preliminaryCategory={wizardData.step2.preliminaryCategory || 'DD'}
            onUpdate={updateStep3}
            onContinue={() => goToSubStep('step3', 7)}
            onBack={() => goToSubStep('step3', 5)}
            onAddEvidence={addEvidence}
          />
        )}

        {wizardData.currentStep === 'step3' && wizardData.currentSubStep === 7 && (
          <Step3Screen7
            data={wizardData.step3}
            preliminaryCategory={wizardData.step2.preliminaryCategory || 'DD'}
            criteriaString={wizardData.step2.criteriaString}
            onContinue={() => setWizardData(prev => ({ ...prev, currentStep: 'complete' }))}
            onBack={() => {
              // Determine which screen to go back to based on adjustment path
              if (wizardData.step3.adjustmentType !== 'none') {
                goToSubStep('step3', 6);
              } else if (wizardData.step3.hasExtraRegionalInfo === 'no') {
                goToSubStep('step3', 1);
              } else if (wizardData.step3.isIsolated === 'yes') {
                goToSubStep('step3', 2);
              } else if (wizardData.step3.rescueLikely !== 'yes') {
                goToSubStep('step3', 3);
              } else {
                goToSubStep('step3', 6);
              }
            }}
          />
        )}

        {/* COMPLETE SCREEN */}
        {wizardData.currentStep === 'complete' && (
          <CompleteScreen
            wizardData={wizardData}
            taxonName={taxonName}
            scientificName={scientificName}
            region={region}
            populationType={populationType}
            onExport={handleExportComplete}
            onReturnToAssessments={() => {
              // Clean up wizard data when returning without export
              localStorage.removeItem(`wizard_${assessmentId}`);
              onComplete();
            }}
          />
        )}
      </div>

      {/* Evidence Sheet */}
      {showEvidenceSheet && (
        <EvidenceSheet
          field={currentEvidenceField}
          onClose={() => setShowEvidenceSheet(false)}
          onAdd={(evidence) => {
            // Add evidence to appropriate field
            toast.success('Evidence added');
            setShowEvidenceSheet(false);
          }}
        />
      )}
    </div>
  );

  function handleExportNA() {
    // Export NA record
    const naRecord = {
      taxonName,
      scientificName,
      region,
      outcome: 'NA',
      reason: wizardData.step1.outcomeReason,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(naRecord, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NA-${scientificName.replace(' ', '-')}-${region}.json`;
    a.click();
    
    toast.success('NA record exported');
  }

  function handleExportComplete() {
    // Validate required completion fields
    const hasStep1 = !!wizardData.step1?.outcome;
    const hasStep2 = !!wizardData.step2?.preliminaryCategory || wizardData.step2?.preliminaryCategory === 'DD';

    if (!hasStep1 || !hasStep2) {
      toast.error('Assessment incomplete - missing required data');
      return;
    }

    // Export complete assessment
    const completeRecord = {
      taxonName,
      scientificName,
      region,
      populationType,
      step1: wizardData.step1,
      step2: wizardData.step2,
      step3: wizardData.step3,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(completeRecord, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Assessment-${scientificName.replace(/\s/g, '-')}-${region.replace(/\s/g, '-')}.json`;
    a.click();
    
    // Clean up wizard data (assessment already marked as completed in useEffect)
    localStorage.removeItem(`wizard_${assessmentId}`);
    
    toast.success('Assessment exported');
    
    // Navigate back after short delay
    setTimeout(() => onComplete(), 500);
  }
}

function checkIfRegionHasFilter(region: string): boolean {
  const regionsWithFilter = ['North America', 'Europe'];
  return regionsWithFilter.includes(region);
}

// ========================================
// STEP 1 SCREENS
// ========================================

interface Step1Screen1Props {
  data: WizardData['step1'];
  onUpdate: (updates: Partial<WizardData['step1']>) => void;
  onContinue: () => void;
  onAddEvidence: (field: string) => void;
}

function Step1Screen1({ data, onUpdate, onContinue, onAddEvidence }: Step1Screen1Props) {
  const canContinue = !!data.populationStatus && !!data.populationStatusBasis;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* Info Banner */}
        <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#60A5FA' }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#60A5FA' }}>Step 1 — Eligibility</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                Determine if this taxon and population are eligible for regional assessment
              </p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Is the population native or a benign introduction?
          </h2>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => onUpdate({ populationStatus: 'native' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.populationStatus === 'native' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.populationStatus === 'native' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.populationStatus === 'native' ? '#D2110C' : '#242632' }}
                >
                  {data.populationStatus === 'native' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Native (within natural range)</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Population occurs within its natural range
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ populationStatus: 'benign-introduction' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.populationStatus === 'benign-introduction' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.populationStatus === 'benign-introduction' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.populationStatus === 'benign-introduction' ? '#D2110C' : '#242632' }}
                >
                  {data.populationStatus === 'benign-introduction' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Benign introduction (conservation, suitable habitat)</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Established for conservation outside recorded distribution but in appropriate habitat
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ populationStatus: 'harmful-introduction' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.populationStatus === 'harmful-introduction' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.populationStatus === 'harmful-introduction' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.populationStatus === 'harmful-introduction' ? '#D2110C' : '#242632' }}
                >
                  {data.populationStatus === 'harmful-introduction' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Harmful introduction → NA</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Invasive or harmful introduction outside natural range
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Documentation */}
          <div className="pt-6 border-t" style={{ borderColor: '#242632' }}>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
              Basis for decision (1-2 sentences) *
            </label>
            <textarea
              value={data.populationStatusBasis || ''}
              onChange={(e) => onUpdate({ populationStatusBasis: e.target.value })}
              placeholder="Describe the reasoning for this classification..."
              className="w-full px-4 py-3 rounded-lg mb-3 min-h-[100px]"
              style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
            />

            <button
              onClick={() => onAddEvidence('populationStatusEvidence')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #242632', color: '#60A5FA' }}
            >
              <Plus className="w-4 h-4" />
              Add Evidence
            </button>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4"
          style={{ 
            background: '#14151A', 
            borderTop: '1px solid #242632',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'
          }}
        >
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              disabled
              className="px-6 py-3 rounded-xl text-base font-semibold transition-all opacity-50"
              style={{ background: 'transparent', border: '2px solid #242632', color: '#FFFFFF' }}
            >
              Back
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
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Step1Screen2Props {
  data: WizardData['step1'];
  onUpdate: (updates: Partial<WizardData['step1']>) => void;
  onContinue: () => void;
  onBack: () => void;
  onAddEvidence: (field: string) => void;
}

function Step1Screen2({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step1Screen2Props) {
  const canContinue = !!data.isVagrant;

  // If harmful introduction, mark as vagrant NA
  useEffect(() => {
    if (data.populationStatus === 'harmful-introduction') {
      onUpdate({ 
        isVagrant: 'yes',
        outcome: 'NA',
        outcomeReason: 'Harmful introduction outside natural range'
      });
    }
  }, [data.populationStatus]);

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Is this taxon a vagrant in the region?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            Vagrants are taxa found only occasionally within a region's boundaries, without predictable occurrence patterns.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ isVagrant: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isVagrant === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isVagrant === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isVagrant === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.isVagrant === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No — Established regional population</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Population occurs predictably and repeatedly in the region
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ isVagrant: 'yes', outcome: 'NA', outcomeReason: 'Vagrant - occasional accidental records only' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isVagrant === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isVagrant === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isVagrant === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.isVagrant === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Vagrant → NA</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Only occasional accidental records without predictable pattern
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

interface Step1Screen3Props {
  data: WizardData['step1'];
  onUpdate: (updates: Partial<WizardData['step1']>) => void;
  onContinue: () => void;
  onBack: () => void;
  onAddEvidence: (field: string) => void;
}

function Step1Screen3({ data, onUpdate, onContinue, onBack, onAddEvidence }: Step1Screen3Props) {
  const canContinue = !!data.isRecentColoniser;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Is this a recent coloniser?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            Recent colonisers are not eligible until sustained reproduction is documented. Default threshold: 10 consecutive years of confirmed reproduction.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ isRecentColoniser: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isRecentColoniser === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isRecentColoniser === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isRecentColoniser === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.isRecentColoniser === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No — Not a recent coloniser</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Population has been established for sufficient time
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ isRecentColoniser: 'yes-over-10' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isRecentColoniser === 'yes-over-10' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isRecentColoniser === 'yes-over-10' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isRecentColoniser === 'yes-over-10' ? '#D2110C' : '#242632' }}
                >
                  {data.isRecentColoniser === 'yes-over-10' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Reproducing ≥10 consecutive years → Eligible</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Reproduction sustained over threshold period
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ isRecentColoniser: 'yes-under-10' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.isRecentColoniser === 'yes-under-10' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.isRecentColoniser === 'yes-under-10' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.isRecentColoniser === 'yes-under-10' ? '#D2110C' : '#242632' }}
                >
                  {data.isRecentColoniser === 'yes-under-10' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Reproducing &lt;10 consecutive years → Not eligible yet</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Insufficient time to confirm sustained reproduction
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

interface Step1Screen4Props {
  data: WizardData['step1'];
  populationType: string;
  onUpdate: (updates: Partial<WizardData['step1']>) => void;
  onContinue: () => void;
  onBack: () => void;
}

function Step1Screen4({ data, populationType, onUpdate, onContinue, onBack }: Step1Screen4Props) {
  const canContinue = populationType !== 'combined' || !!data.canDistinguishBreedingVisiting;

  // If not combined, auto-continue
  useEffect(() => {
    if (populationType !== 'combined') {
      onContinue();
    }
  }, [populationType]);

  if (populationType !== 'combined') {
    return null; // Will auto-continue
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Can breeding and visiting populations be distinguished?
          </h2>

          <p className="text-sm mb-6" style={{ color: '#8E91A3' }}>
            When both breeding and visiting populations exist, it's best practice to assess them separately if distinguishable.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ canDistinguishBreedingVisiting: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.canDistinguishBreedingVisiting === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.canDistinguishBreedingVisiting === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.canDistinguishBreedingVisiting === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.canDistinguishBreedingVisiting === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes → Recommend split assessments</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Create separate breeding and visiting population assessments (best practice)
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ canDistinguishBreedingVisiting: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.canDistinguishBreedingVisiting === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.canDistinguishBreedingVisiting === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.canDistinguishBreedingVisiting === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.canDistinguishBreedingVisiting === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No → Proceed combined</p>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>
                    Assess as single combined population
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

interface Step1Screen5Props {
  data: WizardData['step1'];
  region: string;
  onUpdate: (updates: Partial<WizardData['step1']>) => void;
  onContinue: () => void;
  onBack: () => void;
  onAddEvidence: (field: string) => void;
}

function Step1Screen5({ data, region, onUpdate, onContinue, onBack, onAddEvidence }: Step1Screen5Props) {
  const canContinue = !!data.meetsFilter && (data.meetsFilter === 'no' || (!!data.globalPopPercent && !!data.filterMethod));

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FBB024' }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#FBB024' }}>Regional Filter Active</p>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>
                {region} requires ≥1% of global population to be present in the region for eligibility
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Does the taxon meet the regional inclusion filter?
          </h2>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => onUpdate({ meetsFilter: 'yes' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.meetsFilter === 'yes' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.meetsFilter === 'yes' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.meetsFilter === 'yes' ? '#D2110C' : '#242632' }}
                >
                  {data.meetsFilter === 'yes' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Yes — Meets filter (≥1% global population)</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ meetsFilter: 'no' })}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: data.meetsFilter === 'no' ? 'rgba(210, 17, 12, 0.15)' : 'transparent',
                border: `2px solid ${data.meetsFilter === 'no' ? '#D2110C' : '#242632'}`,
                color: '#FFFFFF'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: data.meetsFilter === 'no' ? '#D2110C' : '#242632' }}
                >
                  {data.meetsFilter === 'no' && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D2110C' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">No — Does not meet filter → NA</p>
                </div>
              </div>
            </button>
          </div>

          {data.meetsFilter === 'yes' && (
            <div className="pt-6 border-t" style={{ borderColor: '#242632' }}>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Estimated % of global population in region *
              </label>
              <input
                type="text"
                value={data.globalPopPercent || ''}
                onChange={(e) => onUpdate({ globalPopPercent: e.target.value })}
                placeholder="e.g., 2.5% or ?"
                className="w-full px-4 py-3 rounded-lg mb-4"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />

              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>
                Method used to estimate % *
              </label>
              <textarea
                value={data.filterMethod || ''}
                onChange={(e) => onUpdate({ filterMethod: e.target.value })}
                placeholder="Describe calculation method and data sources..."
                className="w-full px-4 py-3 rounded-lg mb-3 min-h-[100px]"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />

              <button
                onClick={() => onAddEvidence('filterEvidence')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'transparent', border: '1px solid #242632', color: '#60A5FA' }}
              >
                <Plus className="w-4 h-4" />
                Add Evidence
              </button>
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

interface Step1Screen6Props {
  data: WizardData['step1'];
  onContinue: () => void;
  onBack: () => void;
  onExportNA: () => void;
}

function Step1Screen6({ data, onContinue, onBack, onExportNA }: Step1Screen6Props) {
  const outcome = data.outcome || 'eligible';
  const isEligible = outcome === 'eligible';

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Step 1 Outcome
          </h2>

          {isEligible ? (
            <div className="rounded-xl p-4" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52, 211, 153, 0.2)' }}
                >
                  <span className="text-2xl font-bold" style={{ color: '#34D399' }}>✓</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold mb-1" style={{ color: '#34D399', fontSize: '18px' }}>Eligible</p>
                  <p className="text-sm" style={{ color: '#C9CBD6' }}>
                    This taxon and population meet all Step 1 eligibility criteria. Ready to proceed to Step 2 (Preliminary Category).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ background: 'rgba(142, 145, 163, 0.1)', border: '1px solid rgba(142, 145, 163, 0.3)' }}>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(142, 145, 163, 0.2)' }}
                >
                  <span className="text-2xl font-bold" style={{ color: '#8E91A3' }}>NA</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold mb-1" style={{ color: '#8E91A3', fontSize: '18px' }}>Not Applicable (NA)</p>
                  <p className="text-sm mb-3" style={{ color: '#C9CBD6' }}>
                    This taxon does not meet eligibility criteria for regional assessment.
                  </p>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>Reason:</p>
                    <p className="text-sm" style={{ color: '#FFFFFF' }}>{data.outcomeReason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEligible && (
          <div className="rounded-[18px] card-shadow p-6 mb-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
            <h3 className="text-base font-bold mb-3" style={{ color: '#FFFFFF' }}>NA Record Export</h3>
            <p className="text-sm mb-4" style={{ color: '#8E91A3' }}>
              Even though this assessment cannot proceed, you can export a submission-ready NA record for documentation purposes.
            </p>
            <button
              onClick={onExportNA}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              Export NA Record
            </button>
          </div>
        )}

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
              Back
            </button>
            <button
              onClick={onContinue}
              className="flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              {isEligible ? 'Proceed to Step 2' : 'Return to Assessments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// STEP 2 SCREENS (continuing in next section due to length...)
// ========================================

// Bottom Action Bar Component (reusable)
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

// Evidence Sheet Component
interface EvidenceSheetProps {
  field: string;
  onClose: () => void;
  onAdd: (evidence: any) => void;
}

function EvidenceSheet({ field, onClose, onAdd }: EvidenceSheetProps) {
  const [evidenceType, setEvidenceType] = useState<'citation' | 'file' | 'note' | 'method'>('citation');
  const [citation, setCitation] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    onAdd({ type: evidenceType, citation, note, field, timestamp: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
      <div 
        className="w-full rounded-t-[22px] animate-slide-up max-h-[80vh] overflow-y-auto"
        style={{ background: '#14151A', borderTop: '1px solid #242632' }}
      >
        <div className="sticky top-0 z-10 p-4 flex items-center justify-between" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
          <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Add Evidence</h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" style={{ color: '#8E91A3' }} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {(['citation', 'file', 'note', 'method'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setEvidenceType(type)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                style={{
                  background: evidenceType === type ? '#D2110C' : 'transparent',
                  border: `1px solid ${evidenceType === type ? '#D2110C' : '#242632'}`,
                  color: evidenceType === type ? '#FFFFFF' : '#8E91A3'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {evidenceType === 'citation' && (
            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>Citation</label>
              <textarea
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="Enter citation..."
                className="w-full px-4 py-3 rounded-lg mb-4 min-h-[100px]"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />
            </div>
          )}

          {evidenceType === 'note' && (
            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#C9CBD6' }}>Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter note..."
                className="w-full px-4 py-3 rounded-lg mb-4 min-h-[100px]"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
            style={{ background: '#D2110C', color: '#FFFFFF' }}
          >
            Add Evidence
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 2 and Step 3 screens are imported from separate files
