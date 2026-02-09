import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Shield, Map, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GuidedMockAssessment } from './GuidedMockAssessment';

interface OnboardingProps {
  onComplete: () => void;
}

// Comprehensive global regions with specific rules
const GLOBAL_REGIONS = [
  { 
    id: 'north-america', 
    name: 'North America', 
    authority: 'NatureServe',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally (e.g., wintering waterfowl)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population may be excluded at assessor discretion',
      additionalNotes: 'Must coordinate with state/provincial authorities for subnational assessments'
    }
  },
  { 
    id: 'central-america', 
    name: 'Central America', 
    authority: 'Regional Authority',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Cross-border species require consultation with neighboring countries'
    }
  },
  { 
    id: 'south-america', 
    name: 'South America', 
    authority: 'IUCN Americas',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally (includes Austral migrants)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <0.5% global population may be considered marginal',
      additionalNotes: 'Andean and Amazonian transboundary species require regional coordination'
    }
  },
  { 
    id: 'europe', 
    name: 'Europe', 
    authority: 'European Red List',
    rules: {
      visitorDef: 'Non-breeding populations (wintering, passage migrants)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Must follow EU Birds & Habitats Directive requirements where applicable'
    }
  },
  { 
    id: 'africa', 
    name: 'Africa', 
    authority: 'IUCN Africa',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally (includes Palearctic migrants)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Transfrontier conservation areas may use shared assessment protocols'
    }
  },
  { 
    id: 'middle-east', 
    name: 'Middle East', 
    authority: 'Regional Authority',
    rules: {
      visitorDef: 'Non-breeding populations (wintering birds, passage migrants)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Desert species may have ephemeral populations requiring special consideration'
    }
  },
  { 
    id: 'central-asia', 
    name: 'Central Asia', 
    authority: 'Regional Authority',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Mountain species distributed across elevation zones require careful range delimitation'
    }
  },
  { 
    id: 'south-asia', 
    name: 'South Asia', 
    authority: 'IUCN Asia',
    rules: {
      visitorDef: 'Non-breeding populations (winter visitors, altitudinal migrants)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Endemic species in biodiversity hotspots require rigorous documentation'
    }
  },
  { 
    id: 'southeast-asia', 
    name: 'Southeast Asia', 
    authority: 'ASEAN Centre',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <0.5% global population',
      additionalNotes: 'Island endemics and transboundary species require ASEAN coordination protocols'
    }
  },
  { 
    id: 'east-asia', 
    name: 'East Asia', 
    authority: 'Regional Authority',
    rules: {
      visitorDef: 'Non-breeding populations (wintering, passage migrants)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Migratory species using East Asian-Australasian Flyway require flyway-wide context'
    }
  },
  { 
    id: 'australia-nz', 
    name: 'Australia & New Zealand', 
    authority: 'EPBC Act / DOC NZ',
    rules: {
      visitorDef: 'Non-breeding visitors (e.g., trans-Tasman vagrants vs. regular visitors)',
      reTimeLimit: 'Not before 1788 AD (Australia) / 1769 AD (New Zealand)',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Must distinguish introduced species vs. natural colonizers. Self-introduced species after 10 years may be assessed.'
    }
  },
  { 
    id: 'oceania', 
    name: 'Oceania & Pacific Islands', 
    authority: 'SPREP',
    rules: {
      visitorDef: 'Non-breeding populations present seasonally (rare for island taxa)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Island endemics require careful extinction risk assessment due to small ranges and vulnerability'
    }
  },
  { 
    id: 'arctic', 
    name: 'Arctic', 
    authority: 'CAFF',
    rules: {
      visitorDef: 'Non-breeding summer visitors vs. breeding Arctic specialists',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Climate-sensitive species require trend documentation. Migratory species breeding in Arctic assessed as breeding populations.'
    }
  },
  { 
    id: 'antarctica', 
    name: 'Antarctica', 
    authority: 'SCAR',
    rules: {
      visitorDef: 'Rare (most taxa are breeding residents or do not occur)',
      reTimeLimit: 'Not before 1500 AD',
      optionalFilter: 'Taxa with <1% global population',
      additionalNotes: 'Marine taxa following CCAMLR protocols. Seabirds breeding on sub-Antarctic islands treated as breeding populations.'
    }
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [mockAssessmentComplete, setMockAssessmentComplete] = useState(false);

  const handleStep1Complete = () => {
    if (email && name) {
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('offlineEnabled', 'true');
      setStep(2);
    }
  };

  const handleStep2Complete = () => {
    if (selectedRegion) {
      localStorage.setItem('selectedRegion', selectedRegion);
      setStep(3);
    }
  };

  const handleMockAssessmentComplete = () => {
    setMockAssessmentComplete(true);
  };

  const selectedRegionData = GLOBAL_REGIONS.find(r => r.id === selectedRegion);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Subtle Header with Progress */}
      <div className="px-4 py-3 safe-area-top flex items-center justify-between" style={{ background: 'rgba(20, 21, 26, 0.8)' }}>
        <h1 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>RedList Buddy</h1>
        {/* Minimal progress indicator - dots only */}
        <div className="flex gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full transition-all`} style={{ background: step >= 1 ? '#D2110C' : 'rgba(255, 255, 255, 0.2)' }} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all`} style={{ background: step >= 2 ? '#D2110C' : 'rgba(255, 255, 255, 0.2)' }} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all`} style={{ background: step >= 3 ? '#D2110C' : 'rgba(255, 255, 255, 0.2)' }} />
        </div>
      </div>

      {/* Content - Fixed height, no scroll */}
      <div className="flex-1 overflow-hidden">
        {step === 1 && (
          <OnboardingStep1
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            onNext={handleStep1Complete}
          />
        )}
        {step === 2 && (
          <OnboardingStep2
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedRegionData={selectedRegionData}
            onNext={handleStep2Complete}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <OnboardingStep3
            mockAssessmentComplete={mockAssessmentComplete}
            onComplete={handleMockAssessmentComplete}
            onFinish={onComplete}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

function OnboardingStep1({ name, setName, email, setEmail, onNext }: { name: string; setName: (e: string) => void; email: string; setEmail: (e: string) => void; onNext: () => void }) {
  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Fixed Background Image - Does NOT scroll */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1651707265633-6043d4606339?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkbGlmZSUyMGhhYml0YXQlMjBuYXR1cmFsJTIwZW52aXJvbm1lbnR8ZW58MXx8fHwxNzcwNTk1MTQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Wildlife habitat"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay-dark" />
      </div>

      {/* Scrollable Content Region */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: '140px' }}>
        <div className="px-6 pt-12 pb-8">
          <div className="w-full max-w-md mx-auto space-y-6 mt-12">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
                Welcome to RedList Buddy
              </h2>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl text-base"
                style={{ background: 'rgba(20, 21, 26, 0.95)', border: '1px solid #242632', color: '#FFFFFF' }}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="assessor@example.org"
                className="w-full px-4 py-3 rounded-xl text-base"
                style={{ background: 'rgba(20, 21, 26, 0.95)', border: '1px solid #242632', color: '#FFFFFF' }}
              />
            </div>

            {/* Subtle Warning */}
            <p className="text-xs text-center pt-2" style={{ color: '#6B6E7D', opacity: 0.7 }}>
              Important: This app provides best-estimate classifications. All assessments require expert review.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar - Single full-width button centered */}
      <div 
        className="fixed left-0 right-0 bottom-0 px-4 py-4 z-20"
        style={{ 
          background: '#14151A', 
          borderTop: '1px solid #242632',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="w-full max-w-md mx-auto">
          <button
            onClick={onNext}
            disabled={!email || !name}
            className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all"
            style={{
              background: (!email || !name) ? '#4A4A4A' : '#D2110C',
              color: '#FFFFFF',
              opacity: (!email || !name) ? 0.5 : 1
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingStep2({ selectedRegion, setSelectedRegion, selectedRegionData, onNext, onBack }: {
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  selectedRegionData: any;
  onNext: () => void;
  onBack: () => void;
}) {
  const handleRegionClick = (regionId: string) => {
    // Toggle: if clicking the same region, deselect it
    if (selectedRegion === regionId) {
      setSelectedRegion('');
    } else {
      setSelectedRegion(regionId);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Fixed Background Image - Does NOT scroll */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759503408355-4de1b4ee51c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjB3aGFsZXMlMjBvY2VhbiUyMHVuZGVyd2F0ZXJ8ZW58MXx8fHwxNzcwNTk4MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Beautiful whales"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay-dark" />
      </div>

      {/* Scrollable Content Region */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: '140px' }}>
        <div className="px-6 pt-12 pb-8">
          <div className="w-full max-w-md mx-auto space-y-6 mt-8">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                Choose Your Region
              </h2>
            </div>

            {/* Key Principle Card */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(26, 28, 34, 0.95)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
              <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                Red List ≠ Conservation Priority
              </p>
              <p className="text-xs mt-1" style={{ color: '#C9CBD6' }}>
                The IUCN Red List measures <em>extinction risk</em>, not conservation priority. These are separate processes.
              </p>
            </div>

            {/* Region Selector */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                Select Assessment Region
              </label>
              <div className="space-y-2">
                {GLOBAL_REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id)}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: selectedRegion === region.id ? 'rgba(210, 17, 12, 0.25)' : 'rgba(20, 21, 26, 0.95)',
                      border: selectedRegion === region.id ? '2px solid #D2110C' : '1px solid #242632'
                    }}
                  >
                    <div className="font-semibold" style={{ color: '#FFFFFF' }}>{region.name}</div>
                    <div className="text-sm" style={{ color: '#8E91A3' }}>{region.authority}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Regional Rules Display */}
            {selectedRegionData && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(20, 21, 26, 0.95)', border: '1px solid #242632' }}>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Regional Rules: {selectedRegionData.name}</h3>
                <ul className="text-xs space-y-1" style={{ color: '#C9CBD6' }}>
                  <li>• <strong>Visitor:</strong> {selectedRegionData.rules.visitorDef}</li>
                  <li>• <strong>RE limit:</strong> {selectedRegionData.rules.reTimeLimit}</li>
                  <li>• <strong>Filter:</strong> {selectedRegionData.rules.optionalFilter}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div 
        className="fixed left-0 right-0 bottom-0 px-4 py-4 z-20"
        style={{ 
          background: '#14151A', 
          borderTop: '1px solid #242632',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Left - Secondary */}
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all"
            style={{
              background: 'transparent',
              border: '2px solid #242632',
              color: '#FFFFFF'
            }}
          >
            Back
          </button>
          
          {/* Right - Primary */}
          <button
            onClick={onNext}
            disabled={!selectedRegion}
            className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all"
            style={{
              background: !selectedRegion ? '#4A4A4A' : '#D2110C',
              color: '#FFFFFF',
              opacity: !selectedRegion ? 0.5 : 1
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingStep3({ mockAssessmentComplete, onComplete, onFinish, onBack }: {
  mockAssessmentComplete: boolean;
  onComplete: () => void;
  onFinish: () => void;
  onBack: () => void;
}) {
  const [showGuidedMock, setShowGuidedMock] = useState(false);

  if (showGuidedMock) {
    return (
      <GuidedMockAssessment
        onComplete={() => {
          setShowGuidedMock(false);
          onComplete();
          onFinish();
        }}
        onClose={() => setShowGuidedMock(false)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Fixed Full-Screen Background Image - Does NOT scroll */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1738328604803-5c8df1657620?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmRhbmdlcmVkJTIwYW1waGliaWFuJTIwZnJvZyUyMGNvbnNlcnZhdGlvbnxlbnwxfHx8fDE3NzA1OTUxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Conservation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay-dark" />
      </div>

      {/* Scrollable Content Region */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: '140px' }}>
        <div className="px-6 pt-12 pb-8">
          <div className="w-full max-w-md mx-auto space-y-8 mt-12">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
                First Guided Assessment
              </h2>
            </div>

            {/* Learn the 3-step process */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg text-center" style={{ color: '#FFFFFF' }}>Learn the 3-step process</h3>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Eligibility', color: '#60A5FA' },
                  { num: 2, title: 'Preliminary', color: '#34D399' },
                  { num: 3, title: 'Adjustment', color: '#A78BFA' },
                ].map(({ num, title, color }) => (
                  <div key={num} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold" style={{ background: `${color}30`, color }}>
                      {num}
                    </div>
                    <p className="font-semibold" style={{ color: '#FFFFFF' }}>{title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div 
        className="fixed left-0 right-0 bottom-0 px-4 py-4 z-20"
        style={{ 
          background: '#14151A', 
          borderTop: '1px solid #242632',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Left - Secondary */}
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all"
            style={{
              background: 'transparent',
              border: '2px solid #242632',
              color: '#FFFFFF'
            }}
          >
            Back
          </button>
          
          {/* Right - Primary */}
          <button
            onClick={() => setShowGuidedMock(true)}
            className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all"
            style={{
              background: '#D2110C',
              color: '#FFFFFF'
            }}
          >
            Start Guided Mock Assessment
          </button>
        </div>
      </div>
    </div>
  );
}