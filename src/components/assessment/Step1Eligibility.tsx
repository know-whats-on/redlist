import React, { useState } from 'react';
import { ChevronRight, AlertCircle, Info } from 'lucide-react';
import { AssessmentData } from '../AssessmentWorkflow';

interface Step1EligibilityProps {
  data: AssessmentData;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function Step1Eligibility({ data, onUpdate, onNext }: Step1EligibilityProps) {
  const [isNative, setIsNative] = useState<boolean | null>(data.step1?.isNative ?? null);
  const [hasBreeding, setHasBreeding] = useState<boolean | null>(data.step1?.hasBreeding ?? null);
  const [hasVisiting, setHasVisiting] = useState<boolean | null>(data.step1?.hasVisiting ?? null);
  const [isVagrant, setIsVagrant] = useState<boolean | null>(data.step1?.isVagrant ?? null);
  const [rationale, setRationale] = useState(data.step1?.rationale || '');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const eligible = isNative === true && isVagrant === false && (hasBreeding === true || hasVisiting === true);

  const handleContinue = () => {
    onUpdate({
      isNative,
      hasBreeding,
      hasVisiting,
      isVagrant,
      eligible,
      rationale,
    });
    if (eligible) {
      onNext();
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="rounded-[18px] px-4 py-3" style={{ background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
        <h2 className="font-semibold" style={{ color: '#60A5FA' }}>Step 1: Eligibility & Filtering</h2>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>Determine if the taxon should be assessed</p>
      </div>

      {/* Important Note */}
      <div className="rounded-[18px] card-shadow p-4 flex items-start gap-3" style={{ background: '#1A1C22', border: '1px solid #B45309' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FCD34D' }} />
        <div className="text-sm" style={{ color: '#FCD34D' }}>
          <strong>Critical:</strong> Only assess wild populations within their natural range or benign introductions. Vagrants must NOT be assessed.
        </div>
      </div>

      {/* Question 1: Native or Introduced */}
      <QuestionCard
        title="Is the population native or a benign introduction?"
        tooltip="Native populations occur within the species' natural range. Benign introductions are formally authorized reintroductions. Other introduced taxa should be classified as NA (Not Applicable)."
        showTooltip={showTooltip === 'native'}
        onToggleTooltip={() => setShowTooltip(showTooltip === 'native' ? null : 'native')}
      >
        <div className="space-y-3">
          <OptionButton
            selected={isNative === true}
            onClick={() => {
              setIsNative(true);
              if (isNative === false) {
                setHasBreeding(null);
                setHasVisiting(null);
                setIsVagrant(null);
              }
            }}
            title="Yes, native or benign introduction"
            description="Within natural range or authorized reintroduction"
          />
          <OptionButton
            selected={isNative === false}
            onClick={() => {
              setIsNative(false);
              setHasBreeding(null);
              setHasVisiting(null);
              setIsVagrant(null);
            }}
            title="No, introduced (not benign)"
            description="Results in NA (Not Applicable) classification"
          />
        </div>
      </QuestionCard>

      {/* Question 2: Vagrant Check */}
      {isNative === true && (
        <QuestionCard
          title="Is this a vagrant occurrence?"
          tooltip="Vagrants are individuals appearing occasionally or unpredictably outside their normal range. Vagrants should NOT be assessed and are classified as NA or NE."
          showTooltip={showTooltip === 'vagrant'}
          onToggleTooltip={() => setShowTooltip(showTooltip === 'vagrant' ? null : 'vagrant')}
        >
          <div className="space-y-3">
            <OptionButton
              selected={isVagrant === false}
              onClick={() => setIsVagrant(false)}
              title="No, regular occurrence"
              description="Population present predictably or seasonally"
            />
            <OptionButton
              selected={isVagrant === true}
              onClick={() => {
                setIsVagrant(true);
                setHasBreeding(null);
                setHasVisiting(null);
              }}
              title="Yes, vagrant/occasional"
              description="Results in NA classification (not assessed)"
            />
          </div>
        </QuestionCard>
      )}

      {/* Question 3: Breeding Population */}
      {isNative === true && isVagrant === false && (
        <QuestionCard
          title="Is there a breeding population in the region?"
          tooltip="A breeding population reproduces within the region and has done so for at least 10 consecutive years (or fewer if recolonizing after regional extinction)."
          showTooltip={showTooltip === 'breeding'}
          onToggleTooltip={() => setShowTooltip(showTooltip === 'breeding' ? null : 'breeding')}
        >
          <div className="space-y-3">
            <OptionButton
              selected={hasBreeding === true}
              onClick={() => setHasBreeding(true)}
              title="Yes, breeding population present"
              description="Reproduction documented for 10+ years"
            />
            <OptionButton
              selected={hasBreeding === false}
              onClick={() => setHasBreeding(false)}
              title="No breeding population"
              description="May have visiting population only"
            />
          </div>
        </QuestionCard>
      )}

      {/* Question 4: Visiting Population */}
      {isNative === true && isVagrant === false && hasBreeding !== null && (
        <QuestionCard
          title="Is there a visiting (non-breeding) population?"
          tooltip="Visiting populations are present seasonally (e.g., wintering, migrating) but do not breed in the region. Must be distinguished from vagrants which are unpredictable."
          showTooltip={showTooltip === 'visiting'}
          onToggleTooltip={() => setShowTooltip(showTooltip === 'visiting' ? null : 'visiting')}
        >
          <div className="space-y-3">
            <OptionButton
              selected={hasVisiting === true}
              onClick={() => setHasVisiting(true)}
              title="Yes, visiting population present"
              description="Seasonal presence (e.g., wintering, migration)"
            />
            <OptionButton
              selected={hasVisiting === false}
              onClick={() => setHasVisiting(false)}
              title="No visiting population"
              description="Breeding population only (if applicable)"
            />
          </div>
        </QuestionCard>
      )}

      {/* Rationale */}
      {isNative !== null && isVagrant !== null && (
        <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
            Rationale & Evidence
          </label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain the basis for your eligibility decision, including data sources and evidence..."
            className="w-full px-4 py-3 rounded-lg min-h-[100px]"
            style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
          />
          <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
            Required: Document the evidence supporting your answers above
          </p>
        </div>
      )}

      {/* Eligibility Result */}
      {isNative !== null && isVagrant !== null && (hasBreeding !== null || hasVisiting !== null) && (
        <div
          className="rounded-[18px] card-shadow p-4"
          style={{
            background: eligible ? 'rgba(52, 211, 153, 0.1)' : 'rgba(142, 145, 163, 0.1)',
            border: eligible ? '2px solid #34D399' : '2px solid #8E91A3'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: eligible ? '#34D399' : '#8E91A3' }}>
            {eligible ? '✓ Eligible for Assessment' : '✗ Not Eligible (NA)'}
          </h3>
          <p className="text-sm" style={{ color: '#C9CBD6' }}>
            {eligible
              ? 'This taxon meets eligibility criteria and should proceed to Step 2 (Preliminary Category).'
              : isVagrant
              ? 'Vagrant occurrences should not be assessed. Classify as NA (Not Applicable) or NE (Not Evaluated).'
              : !isNative
              ? 'Introduced taxa outside benign reintroductions should be classified as NA (Not Applicable).'
              : 'No breeding or visiting population identified. Cannot proceed with assessment.'}
          </p>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!eligible || !rationale.trim()}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4"
      >
        Continue to Step 2
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

interface QuestionCardProps {
  title: string;
  tooltip: string;
  showTooltip: boolean;
  onToggleTooltip: () => void;
  children: React.ReactNode;
}

function QuestionCard({ title, tooltip, showTooltip, onToggleTooltip, children }: QuestionCardProps) {
  return (
    <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold pr-2" style={{ color: '#FFFFFF' }}>{title}</h3>
        <button
          onClick={onToggleTooltip}
          className="flex-shrink-0"
          style={{ color: '#60A5FA' }}
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
      {showTooltip && (
        <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
          <p className="text-sm" style={{ color: '#C9CBD6' }}>{tooltip}</p>
        </div>
      )}
      {children}
    </div>
  );
}

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}

function OptionButton({ selected, onClick, title, description }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 rounded-lg text-left transition-all"
      style={{
        background: selected ? 'rgba(210, 17, 12, 0.15)' : '#1A1C22',
        border: selected ? '2px solid #D2110C' : '1px solid #242632'
      }}
    >
      <div className="font-semibold" style={{ color: '#FFFFFF' }}>{title}</div>
      <div className="text-sm mt-1" style={{ color: '#8E91A3' }}>{description}</div>
    </button>
  );
}
