import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Globe, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface RegionModuleProps {
  regionId: string;
  onClose: () => void;
}

interface RegionPolicy {
  id: string;
  name: string;
  authority: string;
  visitorDefinition: string;
  vagrantDefinition: string;
  rePolicy: string;
  reEvidence: string[];
  coloniserRule: string;
  filterEnabled: boolean;
  filterRule?: string;
  naturalRangeNote: string;
  outputRequirements: string[];
}

const regionPolicies: Record<string, RegionPolicy> = {
  'north-america': {
    id: 'north-america',
    name: 'North America',
    authority: 'NatureServe',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: true,
    filterRule: 'Include only if ≥1% of global population occurs in the region; otherwise record as NA and document the method used to estimate %.',
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'central-america': {
    id: 'central-america',
    name: 'Central America',
    authority: 'Regional Authority',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'south-america': {
    id: 'south-america',
    name: 'South America',
    authority: 'IUCN Americas',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'europe': {
    id: 'europe',
    name: 'Europe',
    authority: 'European Red List',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: true,
    filterRule: 'Include only if ≥1% of global population occurs in the region; otherwise record as NA and document the method used to estimate %.',
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'africa': {
    id: 'africa',
    name: 'Africa',
    authority: 'IUCN Africa',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'middle-east': {
    id: 'middle-east',
    name: 'Middle East',
    authority: 'Regional Authority',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'central-asia': {
    id: 'central-asia',
    name: 'Central Asia',
    authority: 'Regional Authority',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'south-asia': {
    id: 'south-asia',
    name: 'South Asia',
    authority: 'IUCN Asia',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'southeast-asia': {
    id: 'southeast-asia',
    name: 'Southeast Asia',
    authority: 'ASEAN Centre',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'east-asia': {
    id: 'east-asia',
    name: 'East Asia',
    authority: 'Regional Authority',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'australia-nz': {
    id: 'australia-nz',
    name: 'Australia & New Zealand',
    authority: 'EPBC Act / DOC NZ',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'oceania-pacific': {
    id: 'oceania-pacific',
    name: 'Oceania & Pacific Islands',
    authority: 'SPREP',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'arctic': {
    id: 'arctic',
    name: 'Arctic',
    authority: 'CAFF',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  },
  'antarctica': {
    id: 'antarctica',
    name: 'Antarctica',
    authority: 'SCAR',
    visitorDefinition: 'A taxon that occurs predictably and repeatedly in the region during some part of the year (breeding or non-breeding), documented across multiple years.',
    vagrantDefinition: 'A taxon recorded only occasionally or accidentally, without a predictable pattern.',
    rePolicy: 'RE (Regionally Extinct): No reasonable doubt the last potentially reproductive individual in the region has died or disappeared. Time-limit principle: RE should not normally be applied to extinctions that occurred before 1500 AD.',
    reEvidence: ['Targeted surveys/search effort appropriate to detectability', 'Review of historical records', 'Expert consultation note'],
    coloniserRule: 'Do not assess newly colonising taxa until reproduction is sustained over multiple years—use 10 consecutive years of confirmed reproduction as the default threshold.',
    filterEnabled: false,
    naturalRangeNote: 'When natural range boundaries are unclear, document the reasoning and sources used to define the regional population, and apply the eligibility rules conservatively.',
    outputRequirements: [
      'Regional category + criteria',
      'Global category + criteria (if known)',
      'Estimated % of global population in region (or "?")',
      'Whether Step 3 adjusted the category, including number of steps changed'
    ]
  }
};

export function RegionModule({ regionId, onClose }: RegionModuleProps) {
  const policy = regionPolicies[regionId];
  const [isReviewed, setIsReviewed] = useState(false);
  const [reviewedDate, setReviewedDate] = useState<string | null>(null);

  useEffect(() => {
    // Check if this region has been reviewed
    const reviewed = localStorage.getItem(`regionPolicy_${regionId}_reviewed`);
    if (reviewed) {
      setIsReviewed(true);
      setReviewedDate(reviewed);
    }
  }, [regionId]);

  if (!policy) return null;

  const handleMarkAsReviewed = () => {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`regionPolicy_${regionId}_reviewed`, timestamp);
    setIsReviewed(true);
    setReviewedDate(timestamp);
    
    // Show toast
    toast.success('Marked as reviewed');
    
    // Dispatch event to update Library
    const event = new CustomEvent('regionModuleReviewed', { detail: { regionId } });
    window.dispatchEvent(event);
    
    // Navigate back immediately
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleMarkAsNotReviewed = () => {
    localStorage.removeItem(`regionPolicy_${regionId}_reviewed`);
    setIsReviewed(false);
    setReviewedDate(null);
    toast.info('Region policy marked as not reviewed');
  };

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4 safe-area-top backdrop-blur-sm bg-black/60" style={{ borderBottom: '1px solid #242632' }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="p-2 -ml-2">
            <X className="w-5 h-5" style={{ color: '#8E91A3' }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
              Policy
            </span>
            <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(142, 145, 163, 0.15)', color: '#8E91A3' }}>
              Editable by Admin
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{policy.name}</h1>
        <p className="text-sm" style={{ color: '#8E91A3' }}>{policy.authority}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" style={{ paddingBottom: '100px' }}>
        {/* Section 1: What this affects */}
        <PolicySection
          icon={<Globe className="w-5 h-5" style={{ color: '#60A5FA' }} />}
          title="What This Affects"
          items={[
            'Eligibility (visitor vs vagrant boundary)',
            'RE policy (what RE means + evidentiary expectations)',
            policy.filterEnabled ? 'Optional filters (enabled)' : 'Optional filters (not used)',
            'Natural range interpretation notes',
            'Output requirements'
          ]}
        />

        {/* Section 2: Visitor vs Vagrant */}
        <PolicySection
          icon={<Shield className="w-5 h-5" style={{ color: '#34D399' }} />}
          title="Visitor vs Vagrant"
          textBlocks={[
            { label: 'Visitor', value: policy.visitorDefinition },
            { label: 'Vagrant', value: policy.vagrantDefinition },
            { label: 'Rule', value: 'If vagrant → NA' }
          ]}
        />

        {/* Section 3: RE Policy */}
        <PolicySection
          icon={<FileText className="w-5 h-5" style={{ color: '#A78BFA' }} />}
          title="RE (Regionally Extinct) Policy"
          textBlocks={[
            { label: 'Definition', value: policy.rePolicy }
          ]}
          items={policy.reEvidence}
          itemsLabel="Evidence checklist"
        />

        {/* Section 4: Recent Coloniser Rule */}
        <PolicySection
          icon={<FileText className="w-5 h-5" style={{ color: '#F59E0B' }} />}
          title="Recent Coloniser Rule"
          textBlocks={[
            { label: 'Standard', value: policy.coloniserRule }
          ]}
        />

        {/* Section 5: Pre-assessment Filters */}
        <PolicySection
          icon={<CheckCircle className="w-5 h-5" style={{ color: policy.filterEnabled ? '#10B981' : '#8E91A3' }} />}
          title="Pre-assessment Filters"
          textBlocks={[
            { label: 'Filter enabled?', value: policy.filterEnabled ? 'YES' : 'NO' },
            ...(policy.filterEnabled && policy.filterRule ? [
              { label: 'Filter rule', value: policy.filterRule }
            ] : [])
          ]}
        />

        {/* Section 6: Natural Range & Introductions */}
        <PolicySection
          icon={<Globe className="w-5 h-5" style={{ color: '#60A5FA' }} />}
          title="Natural Range & Introductions"
          textBlocks={[
            { label: 'Guidance', value: policy.naturalRangeNote }
          ]}
        />

        {/* Section 7: What to Record in Outputs */}
        <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(210, 17, 12, 0.15)' }}>
              <FileText className="w-5 h-5" style={{ color: '#D2110C' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>What to Record in Outputs</h3>
          </div>
          <div className="space-y-2">
            {policy.outputRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#D2110C' }} />
                <p className="text-sm flex-1" style={{ color: '#C9CBD6' }}>{req}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Training Notice */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(142, 145, 163, 0.1)', border: '1px solid rgba(142, 145, 163, 0.3)' }}>
          <p className="text-xs" style={{ color: '#8E91A3' }}>
            These are working defaults for training and can be refined by the authority later. They represent method-aligned policy text, not legal authority.
          </p>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4 safe-area-bottom backdrop-blur-sm bg-black/80" style={{ borderTop: '1px solid #242632' }}>
        {isReviewed && reviewedDate ? (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm font-semibold mb-1" style={{ color: '#34D399' }}>
                Reviewed on {formatReviewDate(reviewedDate)}
              </p>
            </div>
            <button
              onClick={handleMarkAsNotReviewed}
              className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '2px solid #242632',
                color: '#8E91A3'
              }}
            >
              Mark as Not Reviewed
            </button>
          </div>
        ) : (
          <button
            onClick={handleMarkAsReviewed}
            className="w-full py-3 px-4 rounded-xl text-base font-semibold transition-all"
            style={{
              background: 'transparent',
              border: '2px solid #242632',
              color: '#FFFFFF'
            }}
          >
            Mark as Reviewed
          </button>
        )}
      </div>
    </div>
  );
}

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  items?: string[];
  itemsLabel?: string;
  textBlocks?: { label: string; value: string }[];
}

function PolicySection({ icon, title, items, itemsLabel, textBlocks }: PolicySectionProps) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(96, 165, 250, 0.15)' }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{title}</h3>
      </div>
      <div className="space-y-3">
        {textBlocks?.map((block, index) => (
          <div key={index}>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>
              {block.label}
            </label>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>{block.value}</p>
          </div>
        ))}
        {items && (
          <div>
            {itemsLabel && (
              <label className="block text-xs font-semibold mb-2" style={{ color: '#8E91A3' }}>
                {itemsLabel}
              </label>
            )}
            <div className="space-y-1.5">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#60A5FA' }} />
                  <p className="text-sm flex-1" style={{ color: '#C9CBD6' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}