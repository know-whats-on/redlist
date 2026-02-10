import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Clock, CheckCircle, AlertCircle, XCircle, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AssessmentWizard } from './AssessmentWizard';
import { taxonomyDb, TaxonRecord } from '../lib/taxonomyDb';
import { SwipeableAssessmentCard } from './SwipeableAssessmentCard';
import { UndoToast } from './UndoToast';

interface AssessProps {
  onStartAssessment: (assessmentId: string) => void;
}

interface Assessment {
  id: string;
  taxonName: string;
  scientificName: string;
  status: 'draft' | 'ready-for-review' | 'returned' | 'approved' | 'completed';
  currentStep: number;
  lastModified: string;
  category?: string;
  finalCategory?: string;
  criteriaString?: string;
  completedDate?: string;
  completedAt?: string;
  isAdjusted?: boolean;
  adjusted?: boolean;
  adjustedSteps?: number;
  stepsChanged?: number;
  pendingDelete?: boolean;
  pendingDeleteAt?: string;
}

interface PendingDeletion {
  assessmentId: string;
  assessment: Assessment;
  timestamp: number;
}

export function Assess({ onStartAssessment }: AssessProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);

  useEffect(() => {
    // Load assessments from localStorage
    const stored = localStorage.getItem('assessments');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out any pending deletes that have expired
      const filtered = parsed.filter((a: Assessment) => !a.pendingDelete);
      setAssessments(filtered);
    }

    // Listen for assessment completion events
    const handleAssessmentCompleted = () => {
      const stored = localStorage.getItem('assessments');
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((a: Assessment) => !a.pendingDelete);
        setAssessments(filtered);
      }
    };

    // Listen for new assessment trigger from FAB
    const handleOpenNewAssessment = () => setShowNewAssessmentModal(true);

    window.addEventListener('assessmentCompleted', handleAssessmentCompleted);
    window.addEventListener('openNewAssessment', handleOpenNewAssessment);
    
    return () => {
      window.removeEventListener('assessmentCompleted', handleAssessmentCompleted);
      window.removeEventListener('openNewAssessment', handleOpenNewAssessment);
    };
  }, []);

  const handleCreateNew = () => {
    setShowNewAssessmentModal(true);
  };

  const handleCreateAssessment = (taxonName: string, scientificName: string) => {
    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      taxonName,
      scientificName,
      status: 'draft',
      currentStep: 1,
      lastModified: new Date().toISOString(),
    };
    const updated = [...assessments, newAssessment];
    setAssessments(updated);
    localStorage.setItem('assessments', JSON.stringify(updated));
    setShowNewAssessmentModal(false);
    onStartAssessment(newAssessment.id);
  };

  const handleDelete = (assessmentId: string) => {
    // Find the assessment
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    // Remove from UI immediately (optimistic)
    const updatedList = assessments.filter(a => a.id !== assessmentId);
    setAssessments(updatedList);

    // Set up pending deletion
    setPendingDeletion({
      assessmentId,
      assessment,
      timestamp: Date.now()
    });

    // Mark in storage as pending delete (don't actually delete yet)
    const stored = localStorage.getItem('assessments');
    if (stored) {
      const all = JSON.parse(stored);
      const updated = all.map((a: Assessment) => 
        a.id === assessmentId 
          ? { ...a, pendingDelete: true, pendingDeleteAt: new Date().toISOString() }
          : a
      );
      localStorage.setItem('assessments', JSON.stringify(updated));
    }
  };

  const handleUndo = () => {
    if (!pendingDeletion) return;

    // Restore to list
    const restored = [...assessments, pendingDeletion.assessment];
    // Sort to maintain order (or add at top)
    restored.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    setAssessments(restored);

    // Update storage - remove pending delete flag
    const stored = localStorage.getItem('assessments');
    if (stored) {
      const all = JSON.parse(stored);
      const updated = all.map((a: Assessment) =>
        a.id === pendingDeletion.assessmentId
          ? { ...a, pendingDelete: false, pendingDeleteAt: undefined }
          : a
      );
      localStorage.setItem('assessments', JSON.stringify(updated));
    }

    // Clear pending deletion
    setPendingDeletion(null);
  };

  const handleDismissUndo = () => {
    if (!pendingDeletion) return;

    // Permanently delete from storage
    const stored = localStorage.getItem('assessments');
    if (stored) {
      const all = JSON.parse(stored);
      const updated = all.filter((a: Assessment) => a.id !== pendingDeletion.assessmentId);
      localStorage.setItem('assessments', JSON.stringify(updated));
    }

    // Clear pending deletion
    setPendingDeletion(null);
  };

  const draftAssessments = assessments.filter(a => a.status === 'draft');
  const completedAssessments = assessments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 safe-area-top sticky top-0 z-20 backdrop-blur-sm bg-black/30">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>Assessments</h1>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>
          Manage your draft and active assessments
        </p>
      </header>

      {/* Content with bottom padding */}
      <div className="px-4 py-6 content-safe-bottom space-y-6">
        {/* New Assessment Card */}
        <section className="relative overflow-hidden rounded-[22px] card-shadow-raised">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1768737829317-8458524c7053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmRhbmdlcmVkJTIwd2lsZGxpZmUlMjBjb25zZXJ2YXRpb24lMjBuYXR1cmV8ZW58MXx8fHwxNzcwNTk0MTc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Wildlife conservation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 image-overlay-dark" />
          <div className="relative z-10 p-6 min-h-[200px] flex flex-col justify-end">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              Start New Assessment
            </h3>
            <p className="text-sm mb-4" style={{ color: '#C9CBD6' }}>
              Begin a fresh regional assessment following the 3-step IUCN process
            </p>
            <button
              onClick={handleCreateNew}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Assessment
            </button>
          </div>
        </section>

        {/* Draft Assessments */}
        {draftAssessments.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Draft Assessments</h3>
              <span className="text-sm" style={{ color: '#8E91A3' }}>{draftAssessments.length} active</span>
            </div>
            <div className="space-y-3">
              {draftAssessments.map((assessment) => (
                <SwipeableAssessmentCard
                  key={assessment.id}
                  onDelete={() => handleDelete(assessment.id)}
                >
                  <DraftCard
                    assessment={assessment}
                    onClick={() => onStartAssessment(assessment.id)}
                  />
                </SwipeableAssessmentCard>
              ))}
            </div>
          </section>
        )}

        {/* Completed Assessments */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Completed Assessments</h3>
            <span className="text-sm" style={{ color: '#8E91A3' }}>{completedAssessments.length} completed</span>
          </div>
          {completedAssessments.length > 0 ? (
            <div className="space-y-3">
              {completedAssessments.map((assessment) => (
                <SwipeableAssessmentCard
                  key={assessment.id}
                  onDelete={() => handleDelete(assessment.id)}
                >
                  <CompletedCard
                    assessment={assessment}
                    onClick={() => onStartAssessment(assessment.id)}
                  />
                </SwipeableAssessmentCard>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] card-shadow p-6 text-center" style={{ background: '#14151A', border: '1px solid #242632' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>No completed assessments yet</p>
              <p className="text-sm" style={{ color: '#8E91A3' }}>Finish a draft to see it here</p>
            </div>
          )}
        </section>
      </div>

      {/* Undo Toast */}
      {pendingDeletion && (
        <UndoToast
          message="Assessment deleted"
          assessment={pendingDeletion.assessment}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
          duration={6000}
        />
      )}

      {/* New Assessment Modal */}
      {showNewAssessmentModal && (
        <NewAssessmentModal
          onClose={() => setShowNewAssessmentModal(false)}
          onCreate={handleCreateAssessment}
        />
      )}
    </div>
  );
}

interface DraftCardProps {
  assessment: Assessment;
  onClick: () => void;
}

function DraftCard({ assessment, onClick }: DraftCardProps) {
  const stepLabels = ['Eligibility', 'Preliminary', 'Adjustment', 'Complete'];
  const lastModified = new Date(assessment.lastModified);
  const timeAgo = formatTimeAgo(lastModified);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[18px] card-shadow p-4 text-left transition-all active:scale-98"
      style={{ background: '#14151A', border: '1px solid #242632' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate" style={{ color: '#FFFFFF' }}>
            {assessment.taxonName}
          </h4>
          <p className="text-sm italic truncate" style={{ color: '#C9CBD6' }}>
            {assessment.scientificName}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: '#8E91A3' }} />
      </div>
      <div className="flex items-center gap-2">
        <span className="badge badge-neutral text-xs">
          Step {assessment.currentStep}: {stepLabels[assessment.currentStep - 1]}
        </span>
        <span className="text-xs" style={{ color: '#8E91A3' }}>{timeAgo}</span>
      </div>
    </button>
  );
}

interface CompletedCardProps {
  assessment: Assessment;
  onClick: () => void;
}

function CompletedCard({ assessment, onClick }: CompletedCardProps) {
  // Use the canonical completed field names
  const completedTimestamp = assessment.completedAt || assessment.completedDate || assessment.lastModified;
  const completedDate = new Date(completedTimestamp);
  const formattedDate = completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Use finalCategory (new) or fall back to category (old)
  const displayCategory = assessment.finalCategory || assessment.category || 'DD';
  
  // Use adjusted (new) or fall back to isAdjusted (old)
  const isAdjusted = assessment.adjusted || assessment.isAdjusted || false;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[18px] card-shadow p-4 text-left transition-all active:scale-98"
      style={{ background: '#14151A', border: '1px solid #242632' }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate" style={{ color: '#FFFFFF' }}>
            {assessment.taxonName}
          </h4>
          <p className="text-sm italic truncate" style={{ color: '#C9CBD6' }}>
            {assessment.scientificName}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              {displayCategory}
            </p>
            {isAdjusted && (
              <span className="text-base font-bold" style={{ color: '#A78BFA' }}>°</span>
            )}
          </div>
          {assessment.criteriaString ? (
            <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
              {assessment.criteriaString}
            </p>
          ) : (
            <p className="text-xs mt-1" style={{ color: '#8E91A3' }}>
              Not determined
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isAdjusted && (
          <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
            Adjusted
          </span>
        )}
        <span className="text-xs" style={{ color: '#8E91A3' }}>
          Completed {formattedDate}
        </span>
      </div>
    </button>
  );
}

interface NewAssessmentModalProps {
  onClose: () => void;
  onCreate: (taxonName: string, scientificName: string) => void;
}

function NewAssessmentModal({ onClose, onCreate }: NewAssessmentModalProps) {
  const [taxonName, setTaxonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TaxonRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTaxonId, setSelectedTaxonId] = useState<string | null>(null);
  const [hasDownloadedPacks, setHasDownloadedPacks] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const commonNameInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkDownloadedPacks();
    
    // Check for prefilled taxon from Species Index
    const prefilledJson = localStorage.getItem('selectedTaxonForAssessment');
    if (prefilledJson) {
      try {
        const prefilled = JSON.parse(prefilledJson);
        setScientificName(prefilled.scientificName || '');
        setSearchQuery(prefilled.scientificName || '');
        setSelectedTaxonId(prefilled.id || null);
        setIsLinked(true);
        
        // Clear the prefill data
        localStorage.removeItem('selectedTaxonForAssessment');
        
        // Focus common name input after a short delay
        setTimeout(() => {
          commonNameInputRef.current?.focus();
        }, 100);
      } catch (error) {
        console.error('Failed to parse prefilled taxon:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const checkDownloadedPacks = async () => {
    const packs = await taxonomyDb.getInstalledPacks();
    setHasDownloadedPacks(packs.length > 0);
  };

  const performSearch = async () => {
    try {
      // Search across all downloaded packs
      const taxa = await taxonomyDb.taxon
        .where('scientific_name')
        .startsWithIgnoreCase(searchQuery)
        .limit(8)
        .toArray();

      setSearchResults(taxa);
      setShowSuggestions(taxa.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSelectTaxon = (taxon: TaxonRecord) => {
    setScientificName(taxon.scientific_name);
    setSearchQuery(taxon.scientific_name);
    setSelectedTaxonId(taxon.id);
    setIsLinked(true);
    setShowSuggestions(false);
  };

  const handleScientificNameChange = (value: string) => {
    setSearchQuery(value);
    setScientificName(value);
    
    // Clear selection and linked status when manually typing
    if (selectedTaxonId) {
      setSelectedTaxonId(null);
      setIsLinked(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taxonName && scientificName) {
      onCreate(taxonName, scientificName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="rounded-[22px] card-shadow-raised max-w-md w-full p-6 animate-slide-up" style={{ background: '#1A1C22' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#FFFFFF' }}>New Assessment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taxonName" className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
              Common Name
            </label>
            <input
              type="text"
              id="taxonName"
              value={taxonName}
              onChange={(e) => setTaxonName(e.target.value)}
              placeholder="e.g., Mountain Bluebird"
              className="w-full px-4 py-3 rounded-lg transition-all"
              style={{ 
                background: '#14151A',
                border: '1px solid #242632',
                color: '#FFFFFF'
              }}
              required
              ref={commonNameInputRef}
            />
          </div>
          <div className="relative">
            <label htmlFor="scientificName" className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
              Scientific Name
            </label>
            <input
              type="text"
              id="scientificName"
              value={searchQuery}
              onChange={(e) => handleScientificNameChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSuggestions(true);
              }}
              placeholder={hasDownloadedPacks ? "Start typing to search Species Index" : "e.g., Sialia currucoides"}
              className="w-full px-4 py-3 rounded-lg italic transition-all"
              style={{ 
                background: '#14151A',
                border: '1px solid #242632',
                color: '#FFFFFF'
              }}
              required
            />
            
            {/* No packs downloaded hint */}
            {!hasDownloadedPacks && searchQuery.length === 0 && (
              <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
                Download a taxonomy pack in Library → Species Index to enable search.
              </p>
            )}
            
            {/* Matched in Species Index hint */}
            {selectedTaxonId && (
              <p className="text-xs mt-2" style={{ color: '#6EE7B7' }}>
                ✓ Matched in Species Index
              </p>
            )}
            
            {/* No match hint */}
            {!selectedTaxonId && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
                No match found. You can continue with manual entry.
              </p>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div 
                className="absolute z-10 w-full mt-1 rounded-lg overflow-hidden" 
                style={{ background: '#14151A', border: '1px solid #242632', maxHeight: '240px', overflowY: 'auto' }}
              >
                {searchResults.map((taxon, index) => (
                  <button
                    key={taxon.id}
                    type="button"
                    onClick={() => handleSelectTaxon(taxon)}
                    className="w-full px-4 py-3 text-left transition-all hover:bg-white/5"
                    style={{ 
                      borderBottom: index < searchResults.length - 1 ? '1px solid #242632' : 'none'
                    }}
                  >
                    <p className="font-semibold italic" style={{ color: '#FFFFFF' }}>
                      {taxon.scientific_name}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs" style={{ color: '#C9CBD6' }}>
                        {taxon.rank} • {taxon.kingdom || 'Unknown'}
                        {taxon.authorship && ` • ${taxon.authorship}`}
                      </p>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}
                      >
                        Accepted
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-3"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}