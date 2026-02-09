import React from 'react';
import { ChevronRight, X, Globe, FileText, CheckCircle } from 'lucide-react';

interface RegionalRulesProps {
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
}

interface RegionPolicy {
  id: string;
  name: string;
  policyVersion: string;
  lastUpdated: string;
  boundary: string;
  authority: string;
  visitorDefinition: string;
  vagrantDefinition: string;
  visitorCues: string[];
  reTimeLimit: string;
  reEvidence: string[];
  coloniserThreshold: string;
  filterEnabled: boolean;
  filterRule?: string;
  filterOutcome?: string;
  naturalRangeNote: string;
  publicationReqs: string[];
}

const regions: RegionPolicy[] = [
  {
    id: 'australia',
    name: 'Australia (National)',
    policyVersion: 'v2.4',
    lastUpdated: '2025-01-15',
    boundary: 'Continental Australia plus Tasmania and external territories under Commonwealth jurisdiction',
    authority: 'Australian National Red List Authority',
    visitorDefinition: 'Visitor = occurs regularly in Australia during some period of the year for at least the last ~50 years',
    vagrantDefinition: 'Vagrant = only occasional accidental records',
    visitorCues: ['Predictability across years', 'Regular seasonal presence', 'Evidence of repeated occurrence over ~50 years'],
    reTimeLimit: 'Do not normally apply RE to extinctions pre-1500 AD. Require documented search effort and review of historical records.',
    reEvidence: ['Targeted surveys/search effort', 'Historical records reviewed', 'Expert consultation noted'],
    coloniserThreshold: 'Assess only after ≥10 consecutive years of confirmed reproduction OR strong evidence of self-sustaining population',
    filterEnabled: false,
    naturalRangeNote: 'Treat ambiguous historical range boundaries conservatively; document reasoning and sources.',
    publicationReqs: [
      'Regional category + criteria string(s)',
      'Global category + criteria string(s) (if known)',
      'Estimated % of global population in Australia (or "?")',
      'Adjustment marker "°" and steps changed if Step 3 adjusted'
    ]
  },
  {
    id: 'usa',
    name: 'United States (National)',
    policyVersion: 'v3.1',
    lastUpdated: '2024-12-20',
    boundary: 'All 50 states, DC, and associated territories (Puerto Rico, US Virgin Islands, Guam, etc.)',
    authority: 'US National Red List Committee',
    visitorDefinition: 'Visitor = predictable seasonal occurrence (e.g., wintering/migration stopover) with repeated records',
    vagrantDefinition: 'Vagrant = rare irregular strays outside normal migratory routes',
    visitorCues: ['Predictability across years', 'Regular seasonal presence', 'Evidence of repeated occurrence'],
    reTimeLimit: 'Do not normally apply RE to pre-1500 AD; require evidence of survey effort and absence across appropriate time window.',
    reEvidence: ['Targeted surveys/search effort', 'Historical records reviewed', 'Expert consultation noted'],
    coloniserThreshold: '≥10 consecutive breeding seasons OR evidence of established reproducing population with multiple sites',
    filterEnabled: true,
    filterRule: 'Include only if ≥1% of global population occurs in the US',
    filterOutcome: 'Taxa below threshold → NA with documented method and % estimate',
    naturalRangeNote: 'Use native range maps; document uncertainty where taxonomy/range is disputed.',
    publicationReqs: [
      'Regional category + criteria string(s)',
      'Global category + criteria string(s) (if known)',
      'If filter applied, still display global category and flag "NA due to filter"',
      'Adjustment marker "°" and steps changed if Step 3 adjusted'
    ]
  },
  {
    id: 'canada',
    name: 'Canada (National)',
    policyVersion: 'v2.8',
    lastUpdated: '2025-02-01',
    boundary: 'All provinces and territories of Canada',
    authority: 'Canadian Wildlife Service - Red List Section',
    visitorDefinition: 'Visitor = regular seasonal presence (breeding or non-breeding) documented in national monitoring',
    vagrantDefinition: 'Vagrant = sporadic accidental occurrence without pattern',
    visitorCues: ['Predictability across years', 'Regular seasonal presence', 'Evidence of repeated occurrence in monitoring records'],
    reTimeLimit: 'Same default RE principles; require documented survey effort appropriate to detectability.',
    reEvidence: ['Targeted surveys/search effort', 'Historical records reviewed', 'Expert consultation noted'],
    coloniserThreshold: '≥10 years reproduction OR established with evidence of recruitment (offspring survival)',
    filterEnabled: false,
    naturalRangeNote: 'If range edges shift due to climate, document as colonisation vs range change with evidence.',
    publicationReqs: [
      'Regional category + criteria string(s)',
      'Global category + criteria string(s) (if known)',
      'Estimated % of global population in Canada (or "?")',
      'Adjustment marker "°" and steps changed if applicable'
    ]
  },
  {
    id: 'eu',
    name: 'European Union (Regional bloc)',
    policyVersion: 'v1.9',
    lastUpdated: '2024-11-30',
    boundary: 'All 27 EU member states plus outermost regions (per Treaty on European Union)',
    authority: 'EU Biodiversity Assessment Working Group',
    visitorDefinition: 'Visitor = regular occurrence across EU member states (breeding or recurring non-breeding)',
    vagrantDefinition: 'Vagrant = irregular accidental',
    visitorCues: ['Predictability across years', 'Regular seasonal presence across member states', 'Evidence of repeated occurrence'],
    reTimeLimit: 'Same RE evidentiary standard + do not normally pre-date 1500 AD.',
    reEvidence: ['Targeted surveys/search effort', 'Historical records reviewed', 'Expert consultation noted'],
    coloniserThreshold: 'Require sustained reproduction across multiple member-state records (≥10 years) before assessment',
    filterEnabled: true,
    filterRule: 'Include only if ≥1% global population occurs within EU boundaries',
    filterOutcome: 'Taxa below threshold → NA with documentation',
    naturalRangeNote: 'Clarify boundary if species occurs in outermost regions; document decision.',
    publicationReqs: [
      'Regional category + criteria string(s)',
      'Global category + criteria string(s) (if known)',
      'Estimated % of global population in EU (or "?")',
      'Member-state notes as evidence tags (optional)',
      'Adjustment marker "°" and steps changed if applicable'
    ]
  },
  {
    id: 'south-africa',
    name: 'South Africa (National)',
    policyVersion: 'v2.2',
    lastUpdated: '2024-10-10',
    boundary: 'Republic of South Africa (all nine provinces)',
    authority: 'South African National Biodiversity Institute (SANBI)',
    visitorDefinition: 'Visitor = regular seasonal presence documented',
    vagrantDefinition: 'Vagrant = occasional accidental',
    visitorCues: ['Predictability across years', 'Regular seasonal presence', 'Evidence of repeated occurrence'],
    reTimeLimit: 'Same RE standard and time-limit principle; require documented targeted searches.',
    reEvidence: ['Targeted surveys/search effort', 'Historical records reviewed', 'Expert consultation noted'],
    coloniserThreshold: '≥10 years reproduction OR evidence of stable breeding population',
    filterEnabled: false,
    naturalRangeNote: 'For translocated conservation populations, record whether benign introduction criteria apply.',
    publicationReqs: [
      'Regional category + criteria string(s)',
      'Global category + criteria string(s) (if known)',
      'Estimated % of global population in South Africa (or "?")',
      'Adjustment marker "°" and steps changed if applicable'
    ]
  }
];

export function RegionalRules({ selectedRegion, onSelectRegion }: RegionalRulesProps) {
  if (selectedRegion) {
    const region = regions.find(r => r.id === selectedRegion);
    if (!region) return null;

    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
        {/* Header */}
        <div className="sticky top-0 z-20 px-4 py-4 safe-area-top backdrop-blur-sm bg-black/60" style={{ borderBottom: '1px solid #242632' }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSelectRegion(null)}
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#D2110C' }}
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
                {region.policyVersion}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-3" style={{ color: '#FFFFFF' }}>{region.name}</h1>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6 content-safe-bottom">
          {/* Region Boundary & Authority */}
          <PolicySection
            icon={<Globe className="w-5 h-5" style={{ color: '#60A5FA' }} />}
            title="Region Boundary & Authority"
            items={[
              { label: 'Boundary definition', value: region.boundary },
              { label: 'Responsible authority', value: region.authority },
              { label: 'Last updated', value: new Date(region.lastUpdated).toLocaleDateString() }
            ]}
          />

          {/* Visitor vs Vagrant Boundary */}
          <PolicySection
            icon={<FileText className="w-5 h-5" style={{ color: '#34D399' }} />}
            title="Visitor vs Vagrant Boundary"
            items={[
              { label: 'Visitor definition', value: region.visitorDefinition },
              { label: 'Vagrant definition', value: region.vagrantDefinition },
              { label: 'Decision cues used', value: region.visitorCues.join(' • ') }
            ]}
            callout="Rule: vagrants are NA and not assessed."
          />

          {/* RE Policy */}
          <PolicySection
            icon={<CheckCircle className="w-5 h-5" style={{ color: '#A78BFA' }} />}
            title="Regionally Extinct (RE) Policy"
            items={[
              { label: 'RE definition', value: 'No reasonable doubt the last potentially reproductive individual in the region has disappeared/died' },
              { label: 'Time-limit policy', value: region.reTimeLimit },
              { label: 'Evidence expectations', value: region.reEvidence.join(' • ') }
            ]}
          />

          {/* Recent Coloniser Policy */}
          <PolicySection
            icon={<FileText className="w-5 h-5" style={{ color: '#F59E0B' }} />}
            title="Recent Coloniser Policy"
            items={[
              { label: 'Rule', value: 'Do not assess until reproduction is sustained' },
              { label: 'Default threshold', value: region.coloniserThreshold }
            ]}
          />

          {/* Pre-assessment Filter */}
          <PolicySection
            icon={<CheckCircle className="w-5 h-5" style={{ color: region.filterEnabled ? '#10B981' : '#8E91A3' }} />}
            title="Pre-assessment Filter"
            items={[
              { label: 'Filter enabled?', value: region.filterEnabled ? 'YES' : 'NO' },
              ...(region.filterEnabled && region.filterRule ? [
                { label: 'Filter rule', value: region.filterRule },
                { label: 'Below threshold outcome', value: region.filterOutcome || 'NA' }
              ] : [])
            ]}
          />

          {/* Natural Range Interpretation */}
          <PolicySection
            icon={<Globe className="w-5 h-5" style={{ color: '#60A5FA' }} />}
            title="Natural Range Interpretation"
            items={[
              { label: 'Guidance', value: region.naturalRangeNote }
            ]}
          />

          {/* Publication Requirements */}
          <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(210, 17, 12, 0.15)' }}>
                <FileText className="w-5 h-5" style={{ color: '#D2110C' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Publication Requirements</h3>
            </div>
            <div className="space-y-2">
              {region.publicationReqs.map((req, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#D2110C' }} />
                  <p className="text-sm flex-1" style={{ color: '#C9CBD6' }}>{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#D2110C' }}>⚠️ Important</p>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>
              These are training-mode policy seeds. Admins can edit them, but you must always acknowledge the currently active policy version before starting an assessment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Landing screen - list of regions
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>Regional Rules</h2>
        <p className="text-sm" style={{ color: '#C9CBD6' }}>
          These settings affect eligibility, RE, visitors, and filters. Review before drafting.
        </p>
      </div>

      {regions.map((region) => (
        <button
          key={region.id}
          onClick={() => onSelectRegion(region.id)}
          className="w-full rounded-[18px] card-shadow p-5 text-left transition-all active:scale-98"
          style={{ background: '#14151A', border: '1px solid #242632' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>{region.name}</h3>
              <p className="text-sm mb-3" style={{ color: '#8E91A3' }}>{region.authority}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
                  Policy {region.policyVersion}
                </span>
                <span className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(142, 145, 163, 0.15)', color: '#8E91A3' }}>
                  Updated {new Date(region.lastUpdated).toLocaleDateString()}
                </span>
                {region.filterEnabled && (
                  <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                    Filter ON
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#8E91A3' }} />
          </div>
        </button>
      ))}
    </div>
  );
}

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  items: { label: string; value: string }[];
  callout?: string;
}

function PolicySection({ icon, title, items, callout }: PolicySectionProps) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#14151A', border: '1px solid #242632' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(96, 165, 250, 0.15)' }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index}>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#8E91A3' }}>
              {item.label}
            </label>
            <p className="text-sm" style={{ color: '#C9CBD6' }}>{item.value}</p>
          </div>
        ))}
      </div>
      {callout && (
        <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(210, 17, 12, 0.1)', border: '1px solid rgba(210, 17, 12, 0.3)' }}>
          <p className="text-xs font-semibold" style={{ color: '#D2110C' }}>{callout}</p>
        </div>
      )}
    </div>
  );
}
