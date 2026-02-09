import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Settings, Download, Upload, Trash2, Check, Lock } from 'lucide-react';
import { BadgeIcons } from './BadgeIcons';

interface Badge {
  id: string;
  name: string;
  type: 'core' | 'region';
  earned: boolean;
  earnedAt?: string;
}

interface ProfileProps {
  onResetToOnboarding: () => void;
  onNavigateHome: () => void;
}

export function Profile({ onResetToOnboarding, onNavigateHome }: ProfileProps) {
  const [name, setName] = useState(localStorage.getItem('userName') || '');
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || 'user@example.org');
  const [region, setRegion] = useState(localStorage.getItem('selectedRegion') || 'Unknown');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadBadges();

    // Listen for module completion events
    const handleModuleComplete = () => loadBadges();
    const handleRegionReviewed = () => loadBadges();

    window.addEventListener('moduleCompleted', handleModuleComplete);
    window.addEventListener('regionModuleReviewed', handleRegionReviewed);

    return () => {
      window.removeEventListener('moduleCompleted', handleModuleComplete);
      window.removeEventListener('regionModuleReviewed', handleRegionReviewed);
    };
  }, []);

  const loadBadges = () => {
    const moduleProgress = JSON.parse(localStorage.getItem('moduleProgress') || '{"step1":0,"step2":0,"step3":0}');
    
    const allBadges: Badge[] = [
      // Core module badges
      {
        id: 'eligibility-ace',
        name: 'Eligibility Ace',
        type: 'core',
        earned: moduleProgress.step1 >= 100,
        earnedAt: moduleProgress.step1 >= 100 ? localStorage.getItem('badge_eligibility-ace_date') || new Date().toISOString() : undefined
      },
      {
        id: 'criteria-crafter',
        name: 'Criteria Crafter',
        type: 'core',
        earned: moduleProgress.step2 >= 100,
        earnedAt: moduleProgress.step2 >= 100 ? localStorage.getItem('badge_criteria-crafter_date') || new Date().toISOString() : undefined
      },
      {
        id: 'rescue-strategist',
        name: 'Rescue Strategist',
        type: 'core',
        earned: moduleProgress.step3 >= 100,
        earnedAt: moduleProgress.step3 >= 100 ? localStorage.getItem('badge_rescue-strategist_date') || new Date().toISOString() : undefined
      },
      // Region module badges
      {
        id: 'north-america',
        name: 'North America',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_north-america_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_north-america_reviewed') || undefined
      },
      {
        id: 'central-america',
        name: 'Central America',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_central-america_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_central-america_reviewed') || undefined
      },
      {
        id: 'south-america',
        name: 'South America',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_south-america_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_south-america_reviewed') || undefined
      },
      {
        id: 'europe',
        name: 'Europe',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_europe_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_europe_reviewed') || undefined
      },
      {
        id: 'africa',
        name: 'Africa',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_africa_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_africa_reviewed') || undefined
      },
      {
        id: 'middle-east',
        name: 'Middle East',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_middle-east_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_middle-east_reviewed') || undefined
      },
      {
        id: 'central-asia',
        name: 'Central Asia',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_central-asia_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_central-asia_reviewed') || undefined
      },
      {
        id: 'south-asia',
        name: 'South Asia',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_south-asia_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_south-asia_reviewed') || undefined
      },
      {
        id: 'southeast-asia',
        name: 'Southeast Asia',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_southeast-asia_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_southeast-asia_reviewed') || undefined
      },
      {
        id: 'east-asia',
        name: 'East Asia',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_east-asia_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_east-asia_reviewed') || undefined
      },
      {
        id: 'australia-nz',
        name: 'Australia & NZ',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_australia-nz_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_australia-nz_reviewed') || undefined
      },
      {
        id: 'oceania-pacific',
        name: 'Oceania & Pacific',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_oceania-pacific_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_oceania-pacific_reviewed') || undefined
      },
      {
        id: 'arctic',
        name: 'Arctic',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_arctic_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_arctic_reviewed') || undefined
      },
      {
        id: 'antarctica',
        name: 'Antarctica',
        type: 'region',
        earned: !!localStorage.getItem('regionPolicy_antarctica_reviewed'),
        earnedAt: localStorage.getItem('regionPolicy_antarctica_reviewed') || undefined
      }
    ];

    setBadges(allBadges);
  };

  const handleSaveEdit = () => {
    setName(tempName);
    setEmail(tempEmail);
    localStorage.setItem('userName', tempName);
    localStorage.setItem('userEmail', tempEmail);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempName(name);
    setTempEmail(email);
    setIsEditing(false);
  };

  const handleExportData = () => {
    const assessments = localStorage.getItem('assessments');
    const moduleProgress = localStorage.getItem('moduleProgress');
    
    // Collect all region reviewed states
    const regionReviewed: Record<string, string | null> = {};
    const regions = [
      'north-america', 'central-america', 'south-america', 'europe', 'africa',
      'middle-east', 'central-asia', 'south-asia', 'southeast-asia', 'east-asia',
      'australia-nz', 'oceania-pacific', 'arctic', 'antarctica'
    ];
    
    regions.forEach(regionId => {
      const reviewed = localStorage.getItem(`regionPolicy_${regionId}_reviewed`);
      if (reviewed) {
        regionReviewed[regionId] = reviewed;
      }
    });

    const exportData = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      profile: {
        displayName: name,
        email: email,
        region: region
      },
      moduleProgress: moduleProgress ? JSON.parse(moduleProgress) : { step1: 0, step2: 0, step3: 0 },
      regionReviewed,
      assessments: assessments ? JSON.parse(assessments) : [],
      badges: badges.filter(b => b.earned).map(b => ({
        id: b.id,
        name: b.name,
        earnedAt: b.earnedAt
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redlist-buddy-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate schema
      if (!data.schemaVersion) {
        throw new Error('Missing schema version');
      }

      if (data.schemaVersion !== '1.0') {
        throw new Error(`Unsupported schema version: ${data.schemaVersion}`);
      }

      // Validate required fields
      if (!data.exportedAt || !data.profile) {
        throw new Error('Missing required fields');
      }

      // Import profile
      if (data.profile.displayName) {
        localStorage.setItem('userName', data.profile.displayName);
        setName(data.profile.displayName);
      }
      if (data.profile.email) {
        localStorage.setItem('userEmail', data.profile.email);
        setEmail(data.profile.email);
      }
      if (data.profile.region) {
        localStorage.setItem('selectedRegion', data.profile.region);
        setRegion(data.profile.region);
      }

      // Import module progress
      if (data.moduleProgress) {
        localStorage.setItem('moduleProgress', JSON.stringify(data.moduleProgress));
      }

      // Import region reviewed states
      if (data.regionReviewed) {
        Object.entries(data.regionReviewed).forEach(([regionId, timestamp]) => {
          if (timestamp) {
            localStorage.setItem(`regionPolicy_${regionId}_reviewed`, timestamp as string);
          }
        });
      }

      // Import assessments
      if (data.assessments && Array.isArray(data.assessments)) {
        localStorage.setItem('assessments', JSON.stringify(data.assessments));
      }

      // Recompute badges
      loadBadges();

      // Show success and navigate to Home
      setImportSuccess(true);
      setIsImporting(false);

      setTimeout(() => {
        onNavigateHome();
      }, 1500);

    } catch (error) {
      setIsImporting(false);
      if (error instanceof SyntaxError) {
        setImportError('Invalid JSON file');
      } else if (error instanceof Error) {
        setImportError(error.message);
      } else {
        setImportError('Failed to import data');
      }
    }

    // Reset file input
    event.target.value = '';
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    setShowResetModal(false);
    onResetToOnboarding();
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure? This will delete all your data and cannot be undone.')) {
      localStorage.clear();
      onResetToOnboarding();
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const totalBadges = badges.length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 safe-area-top" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <h1 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Profile</h1>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>Account, badges, and data management</p>
      </header>

      {/* Content */}
      <div className="px-4 py-6 content-safe-bottom space-y-6">
        {/* User Info */}
        <section className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#FFFFFF' }}>Account Information</h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-sm px-3 py-1.5 rounded-lg transition-all"
                style={{ background: '#1A1C22', border: '1px solid #242632', color: '#60A5FA' }}
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ background: '#1A1C22', border: '1px solid #242632', color: '#FFFFFF' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCancelEdit} className="flex-1 btn-secondary py-3">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="flex-1 btn-primary py-3">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" style={{ color: '#8E91A3' }} />
                <div>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>Name</p>
                  <p className="font-medium" style={{ color: '#FFFFFF' }}>{name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: '#8E91A3' }} />
                <div>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>Email</p>
                  <p className="font-medium" style={{ color: '#FFFFFF' }}>{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" style={{ color: '#8E91A3' }} />
                <div>
                  <p className="text-sm" style={{ color: '#8E91A3' }}>Region</p>
                  <p className="font-medium capitalize" style={{ color: '#FFFFFF' }}>{region.replace('-', ' ')}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Badges */}
        <section className="rounded-[18px] card-shadow p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold" style={{ color: '#FFFFFF' }}>Badges</h2>
            <span className="text-sm font-semibold" style={{ color: '#D9B24C' }}>
              {earnedBadges.length}/{totalBadges}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>

        {/* Data Management */}
        <section className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>Data</h2>
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-semibold"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              <Download className="w-5 h-5" />
              <div>
                <p className="font-semibold">Export Data (JSON)</p>
                <p className="text-xs font-normal opacity-90">Download complete assessment archive</p>
              </div>
            </button>

            <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer"
              style={{ background: 'transparent', border: '1px solid #D2110C', color: '#D2110C' }}
            >
              <Upload className="w-5 h-5" />
              <div>
                <p className="font-semibold">Import Data (JSON)</p>
                <p className="text-xs font-normal opacity-90">Restore from backup file</p>
              </div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* Other Actions */}
        <section className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>Settings</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
              style={{ background: '#1A1C22', border: '1px solid #242632' }}
            >
              <Settings className="w-5 h-5" style={{ color: '#60A5FA' }} />
              <div>
                <p className="font-medium" style={{ color: '#FFFFFF' }}>Reset Onboarding</p>
                <p className="text-xs" style={{ color: '#8E91A3' }}>Restart the tutorial</p>
              </div>
            </button>

            <button
              onClick={handleClearAllData}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
              style={{ background: '#1A1C22', border: '1px solid rgba(210, 17, 12, 0.2)' }}
            >
              <Trash2 className="w-5 h-5" style={{ color: '#D2110C' }} />
              <div>
                <p className="font-medium" style={{ color: '#D2110C' }}>Clear All Data</p>
                <p className="text-xs" style={{ color: '#8E91A3' }}>Delete all assessments and reset app</p>
              </div>
            </button>
          </div>
        </section>

        {/* App Info */}
        <section className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <h2 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>About</h2>
          <div className="space-y-2 text-sm" style={{ color: '#C9CBD6' }}>
            <p>
              <strong style={{ color: '#FFFFFF' }}>RedList Buddy</strong>
            </p>
            <p>Version 1.0.0</p>
            <p className="text-xs mt-4" style={{ color: '#8E91A3' }}>
              This app implements the IUCN Regional/National Red List Guidelines 
              for educational and assessment drafting purposes. All assessments 
              require expert review before publication.
            </p>
          </div>
        </section>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="rounded-[22px] card-shadow-raised max-w-md w-full p-6 animate-slide-up" style={{ background: '#1A1C22' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Reset Onboarding?</h2>
            <p className="text-sm mb-6" style={{ color: '#C9CBD6' }}>
              This will restart the tutorial from the beginning. Your assessments and progress will not be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 btn-secondary py-3">
                Cancel
              </button>
              <button onClick={handleResetOnboarding} className="flex-1 btn-primary py-3">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Success Toast */}
      {importSuccess && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-2xl animate-slide-down flex items-center gap-2"
          style={{ background: '#10B981', color: '#FFFFFF' }}
        >
          <Check className="w-5 h-5" />
          <p className="text-sm font-semibold">Import successful! Returning to Home...</p>
        </div>
      )}

      {/* Import Error Toast */}
      {importError && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-6 py-4 rounded-xl shadow-2xl max-w-md animate-slide-down"
          style={{ background: '#1A1C22', border: '2px solid #D2110C' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: '#D2110C' }}>Import Failed</p>
              <p className="text-xs" style={{ color: '#C9CBD6' }}>{importError}</p>
            </div>
            <button 
              onClick={() => setImportError(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: '#D2110C', color: '#FFFFFF' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Import Loading */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="rounded-[22px] card-shadow-raised p-8 text-center" style={{ background: '#1A1C22' }}>
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
              style={{ borderColor: '#D2110C', borderTopColor: 'transparent' }}
            />
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Validating import...</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
}

function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = BadgeIcons[badge.id as keyof typeof BadgeIcons];

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative mb-3"
        style={{ 
          width: '96px', 
          height: '96px',
          opacity: badge.earned ? 1 : 0.35
        }}
      >
        {/* Outer gold ring with glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: badge.earned 
              ? 'linear-gradient(135deg, #D9B24C 0%, #8C6B1F 100%)'
              : '#242632',
            padding: '3px',
            filter: badge.earned ? 'drop-shadow(0 0 12px rgba(217, 178, 76, 0.2))' : 'none'
          }}
        >
          {/* Inner dark disk with radial highlight */}
          <div 
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: badge.earned
                ? 'radial-gradient(circle at 40% 40%, #1A1C22 0%, #0F1013 60%)'
                : '#0F1013'
            }}
          >
            {/* Icon */}
            {Icon && (
              <Icon 
                className="w-10 h-10" 
                style={{ 
                  color: badge.earned ? '#D9B24C' : '#8E91A3',
                  opacity: badge.earned ? 1 : 0.5
                }} 
              />
            )}
            
            {/* Lock overlay for locked badges */}
            {!badge.earned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(15, 16, 19, 0.9)' }}
                >
                  <Lock className="w-4 h-4" style={{ color: '#8E91A3' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Badge name */}
      <p 
        className="text-xs font-semibold text-center"
        style={{ 
          color: badge.earned ? '#D9B24C' : '#8E91A3',
          opacity: badge.earned ? 1 : 0.6
        }}
      >
        {badge.name}
      </p>
      
      {/* Status */}
      {badge.earned ? (
        <span 
          className="text-[10px] font-semibold mt-1 px-2 py-0.5 rounded"
          style={{ background: 'rgba(217, 178, 76, 0.15)', color: '#D9B24C' }}
        >
          Completed
        </span>
      ) : (
        <span 
          className="text-[10px] font-semibold mt-1"
          style={{ color: '#8E91A3', opacity: 0.5 }}
        >
          Locked
        </span>
      )}
    </div>
  );
}
