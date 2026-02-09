import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Onboarding } from './components/Onboarding';
import { Assess } from './components/Assess';
import { AssessmentWorkflow } from './components/AssessmentWorkflow';
import { Library } from './components/Library';
import { Profile } from './components/Profile';
import { Home as HomeIcon, ClipboardList, BookOpen, User, Plus, X } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'assess' | 'library' | 'profile'>('home');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    setHasCompletedOnboarding(onboardingComplete === 'true');
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  };

  const handleStartAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setCurrentScreen('assess');
  };

  const handleFABClick = () => {
    // Directly open New Assessment modal (no action sheet)
    setCurrentScreen('home');
    setTimeout(() => {
      const event = new CustomEvent('openNewAssessment');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleNewAssessment = () => {
    setShowActionSheet(false);
    setCurrentScreen('home');
    // Trigger new assessment modal
    setTimeout(() => {
      const event = new CustomEvent('openNewAssessment');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleAddEvidence = () => {
    setShowActionSheet(false);
    setCurrentScreen('library');
    // Navigate to Evidence tab
    setTimeout(() => {
      const event = new CustomEvent('navigateToEvidence');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleNewTaxon = () => {
    setShowActionSheet(false);
    setCurrentScreen('library');
    // Navigate to Taxa tab
    setTimeout(() => {
      const event = new CustomEvent('navigateToTaxa');
      window.dispatchEvent(event);
    }, 100);
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Main content area with bottom nav padding */}
      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'home' && (
          <Home onStartAssessment={handleStartAssessment} onNavigate={(screen) => setCurrentScreen(screen as 'home' | 'assess' | 'library' | 'profile')} />
        )}
        {currentScreen === 'assess' && selectedAssessmentId && (
          <AssessmentWorkflow 
            assessmentId={selectedAssessmentId} 
            onBack={() => {
              setSelectedAssessmentId(null);
              setCurrentScreen('assess');
            }}
          />
        )}
        {currentScreen === 'assess' && !selectedAssessmentId && (
          <Assess onStartAssessment={handleStartAssessment} />
        )}
        {currentScreen === 'library' && <Library />}
        {currentScreen === 'profile' && (
          <Profile 
            onResetToOnboarding={() => setHasCompletedOnboarding(false)} 
            onNavigateHome={() => setCurrentScreen('home')}
          />
        )}
      </main>

      {/* Action Sheet */}
      {showActionSheet && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setShowActionSheet(false)}
        >
          <div 
            className="fixed bottom-0 left-0 right-0 rounded-t-[24px] p-6 animate-slide-up"
            style={{ 
              background: '#1A1C22',
              paddingBottom: 'max(24px, calc(24px + env(safe-area-inset-bottom)))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Create New</h3>
              <button 
                onClick={() => setShowActionSheet(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#14151A' }}
              >
                <X className="w-5 h-5" style={{ color: '#C9CBD6' }} />
              </button>
            </div>
            
            <div className="space-y-3">
              <ActionSheetButton
                title="New Assessment"
                description="Start a guided regional assessment"
                onClick={handleNewAssessment}
              />
              <ActionSheetButton
                title="Add Evidence"
                description="Upload attachments or citations"
                onClick={handleAddEvidence}
              />
              <ActionSheetButton
                title="New Taxon (draft)"
                description="Create a taxon entry"
                onClick={handleNewTaxon}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation with centered FAB */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Nav bar container */}
        <div className="relative">
          {/* Centered FAB - positioned above nav bar */}
          <button
            onClick={handleFABClick}
            className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 z-50"
            style={{ 
              background: '#D2110C',
              top: '-32px', // Half of button height to create overlap
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Create new"
          >
            <Plus className="w-7 h-7" style={{ color: '#FFFFFF' }} strokeWidth={3} />
          </button>

          {/* Nav bar */}
          <div 
            className="backdrop-blur-md"
            style={{ 
              background: 'rgba(20, 21, 26, 0.95)',
              borderTop: '1px solid #242632',
              height: '80px'
            }}
          >
            <div className="flex items-center justify-around h-full px-2">
              {/* Left side - 2 items */}
              <NavButton
                icon={<HomeIcon className="w-6 h-6" />}
                label="Home"
                active={currentScreen === 'home'}
                onClick={() => setCurrentScreen('home')}
              />
              <NavButton
                icon={<ClipboardList className="w-6 h-6" />}
                label="Assess"
                active={currentScreen === 'assess'}
                onClick={() => setCurrentScreen('assess')}
              />
              
              {/* Center spacer for FAB */}
              <div className="w-16" />
              
              {/* Right side - 2 items */}
              <NavButton
                icon={<BookOpen className="w-6 h-6" />}
                label="Library"
                active={currentScreen === 'library'}
                onClick={() => setCurrentScreen('library')}
              />
              <NavButton
                icon={<User className="w-6 h-6" />}
                label="Profile"
                active={currentScreen === 'profile'}
                onClick={() => setCurrentScreen('profile')}
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center min-w-[64px] px-3 py-2 rounded-lg transition-all relative"
      style={{
        color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'
      }}
    >
      <div style={{ color: active ? '#D2110C' : 'rgba(255, 255, 255, 0.6)' }}>
        {icon}
      </div>
      <span className="text-xs mt-1 font-semibold">{label}</span>
      {active && (
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
          style={{ 
            width: '24px',
            background: '#D2110C'
          }}
        />
      )}
    </button>
  );
}

interface ActionSheetButtonProps {
  title: string;
  description: string;
  onClick: () => void;
}

function ActionSheetButton({ title, description, onClick }: ActionSheetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-[18px] transition-all active:scale-98"
      style={{ 
        background: '#14151A',
        border: '1px solid #242632'
      }}
    >
      <h4 className="font-bold mb-1" style={{ color: '#FFFFFF' }}>{title}</h4>
      <p className="text-sm" style={{ color: '#8E91A3' }}>{description}</p>
    </button>
  );
}