import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Step1Eligibility } from './assessment/Step1Eligibility';
import { Step2Preliminary } from './assessment/Step2Preliminary';
import { Step3Adjustment } from './assessment/Step3Adjustment';
import { AssessmentOutput } from './assessment/AssessmentOutput';

interface AssessmentWorkflowProps {
  assessmentId: string | null;
  onBack: () => void;
}

export interface AssessmentData {
  id: string;
  taxonName: string;
  scientificName: string;
  status: string;
  currentStep: number;
  lastModified: string;
  
  // Step 1 data
  step1?: {
    isNative: boolean | null;
    hasBreeding: boolean | null;
    hasVisiting: boolean | null;
    isVagrant: boolean | null;
    eligible: boolean;
    rationale: string;
  };
  
  // Step 2 data
  step2?: {
    populationSize: string;
    populationTrend: string;
    declinePercent: string;
    eoo: string;
    aoo: string;
    locations: string;
    severelyFragmented: boolean;
    threats: string;
    preliminaryCategory: string;
    criteriaMet: string;
    confidence: number;
  };
  
  // Step 3 data
  step3?: {
    rescueEffect: string | null;
    immigrationLikely: boolean | null;
    sourceStable: boolean | null;
    isSink: boolean | null;
    adjustmentSteps: number;
    adjustmentRationale: string;
    finalCategory: string;
  };
}

export function AssessmentWorkflow({ assessmentId, onBack }: AssessmentWorkflowProps) {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (assessmentId) {
      // Load assessment data
      const stored = localStorage.getItem('assessments');
      if (stored) {
        const assessments = JSON.parse(stored);
        const assessment = assessments.find((a: AssessmentData) => a.id === assessmentId);
        if (assessment) {
          setAssessmentData(assessment);
          setCurrentStep(assessment.currentStep || 1);
        }
      }
    } else {
      // Create new assessment template
      setAssessmentData({
        id: `new-${Date.now()}`,
        taxonName: 'New Taxon',
        scientificName: 'Species name',
        status: 'draft',
        currentStep: 1,
        lastModified: new Date().toISOString(),
      });
    }
  }, [assessmentId]);

  const saveAssessment = (data: Partial<AssessmentData>) => {
    if (!assessmentData) return;

    const updated = {
      ...assessmentData,
      ...data,
      lastModified: new Date().toISOString(),
    };

    setAssessmentData(updated);

    // Save to localStorage
    const stored = localStorage.getItem('assessments');
    const assessments = stored ? JSON.parse(stored) : [];
    const index = assessments.findIndex((a: AssessmentData) => a.id === updated.id);
    
    if (index >= 0) {
      assessments[index] = updated;
    } else {
      assessments.push(updated);
    }
    
    localStorage.setItem('assessments', JSON.stringify(assessments));
  };

  const handleStep1Complete = (step1Data: AssessmentData['step1']) => {
    saveAssessment({ step1: step1Data, currentStep: 2 });
    setCurrentStep(2);
  };

  const handleStep2Complete = (step2Data: AssessmentData['step2']) => {
    saveAssessment({ step2: step2Data, currentStep: 3 });
    setCurrentStep(3);
  };

  const handleStep3Complete = (step3Data: AssessmentData['step3']) => {
    saveAssessment({ step3: step3Data, currentStep: 4, status: 'ready-for-review' });
    setCurrentStep(4);
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
  };

  if (!assessmentData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 safe-area-top" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg"
            style={{ color: '#C9CBD6' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate" style={{ color: '#FFFFFF' }}>
              {assessmentData?.taxonName || 'New Assessment'}
            </h1>
            <p className="text-sm italic truncate" style={{ color: '#8E91A3' }}>
              {assessmentData?.scientificName}
            </p>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="px-4 py-3" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: currentStep >= s ? '#D2110C' : '#242632'
              }}
            />
          ))}
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: '#8E91A3' }}>
          Step {currentStep} of 4
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-safe-bottom">
        {currentStep === 1 && assessmentData && (
          <Step1Eligibility
            data={assessmentData}
            onUpdate={handleStep1Complete}
            onNext={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && assessmentData && (
          <Step2Preliminary
            data={assessmentData}
            onUpdate={handleStep2Complete}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && assessmentData && (
          <Step3Adjustment
            data={assessmentData}
            onUpdate={handleStep3Complete}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && assessmentData && (
          <AssessmentOutput
            data={assessmentData}
            onBack={() => setCurrentStep(3)}
            onComplete={onBack}
          />
        )}
      </div>
    </div>
  );
}