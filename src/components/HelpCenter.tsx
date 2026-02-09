import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, AlertTriangle, HelpCircle } from 'lucide-react';

export function HelpCenter() {
  const [activeSection, setActiveSection] = useState<'glossary' | 'howto' | 'troubleshoot'>('glossary');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #0F1013 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 safe-area-top" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <h1 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Help Center</h1>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>Learn about the IUCN assessment process</p>
      </header>

      {/* Tabs */}
      <div className="px-4 overflow-x-auto" style={{ background: '#14151A', borderBottom: '1px solid #242632' }}>
        <div className="flex gap-4">
          <TabButton
            active={activeSection === 'glossary'}
            onClick={() => setActiveSection('glossary')}
            icon={<BookOpen className="w-4 h-4" />}
            label="Glossary"
          />
          <TabButton
            active={activeSection === 'howto'}
            onClick={() => setActiveSection('howto')}
            icon={<HelpCircle className="w-4 h-4" />}
            label="How To"
          />
          <TabButton
            active={activeSection === 'troubleshoot'}
            onClick={() => setActiveSection('troubleshoot')}
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Troubleshoot"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 content-safe-bottom">
        {activeSection === 'glossary' && (
          <GlossarySection expandedItem={expandedItem} toggleItem={toggleItem} />
        )}
        {activeSection === 'howto' && <HowToSection />}
        {activeSection === 'troubleshoot' && <TroubleshootSection />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap"
      style={{
        borderColor: active ? '#D2110C' : 'transparent',
        color: active ? '#D2110C' : '#8E91A3'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function GlossarySection({ expandedItem, toggleItem }: any) {
  const glossaryTerms = [
    { id: 'region', term: 'Region', definition: 'Any area smaller than the entire global range of a taxon. Can be a political unit (country, state, province), biogeographic region, or other subglobal area.' },
    { id: 'rescue', term: 'Rescue Effect', definition: 'Immigration of individuals from extra-regional populations that can reproduce in the region, thereby reducing the regional extinction risk. Usually results in downlisting.' },
    { id: 'visitor', term: 'Visitor', definition: 'A non-breeding population present in the region seasonally or for part of its life cycle (e.g., wintering, migrating). Must be distinguished from vagrants.' },
    { id: 'vagrant', term: 'Vagrant', definition: 'Individuals appearing occasionally or unpredictably outside their normal range. Vagrants should NOT be assessed and are classified as NA or NE.' },
  ];

  return (
    <div className="space-y-3">
      {glossaryTerms.map((item) => (
        <div key={item.id} className="rounded-[18px] card-shadow" style={{ background: '#14151A', border: '1px solid #242632' }}>
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="font-semibold" style={{ color: '#FFFFFF' }}>{item.term}</span>
            {expandedItem === item.id ? (
              <ChevronUp className="w-5 h-5" style={{ color: '#8E91A3' }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: '#8E91A3' }} />
            )}
          </button>
          {expandedItem === item.id && (
            <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid #242632' }}>
              <p className="text-sm" style={{ color: '#C9CBD6' }}>{item.definition}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HowToSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>The 3-Step Assessment Process</h3>
        <div className="space-y-4">
          {[
            { num: 1, title: 'Eligibility & Filtering', desc: 'Determine if the taxon should be assessed. Check for vagrant status, native population, and breeding/visiting populations.', color: '#60A5FA' },
            { num: 2, title: 'Preliminary Category (Regional Data)', desc: 'Apply IUCN Criteria A–E to the regional population only. Do NOT use global data in this step.', color: '#34D399' },
            { num: 3, title: 'Adjustment (Extra-regional Populations)', desc: 'Consider whether extra-regional populations influence regional extinction risk. Typically results in downlisting due to rescue effect.', color: '#A78BFA' },
          ].map(({ num, title, desc, color }) => (
            <div key={num} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: `${color}20`, color }}>
                {num}
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#FFFFFF' }}>{title}</p>
                <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#1A1C22', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#60A5FA' }}>Key Principle</h3>
        <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Red List ≠ Conservation Priority Setting</p>
        <p className="text-sm mt-2" style={{ color: '#C9CBD6' }}>
          The IUCN Red List measures extinction risk, not conservation priority. Do not use Red List categories to create priority rankings.
        </p>
      </div>
    </div>
  );
}

function TroubleshootSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Why can't I assess this taxon?</h3>
        <p className="text-sm mb-3" style={{ color: '#C9CBD6' }}>If a taxon is blocked from assessment, it may be because:</p>
        <ul className="space-y-2 text-sm" style={{ color: '#C9CBD6' }}>
          <li>• It's classified as a vagrant (unpredictable occurrence)</li>
          <li>• It's an introduced taxon that isn't a benign reintroduction</li>
          <li>• It's a recent colonizer without 10+ years of consecutive breeding</li>
        </ul>
      </div>

      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Why didn't Step 3 change my category?</h3>
        <p className="text-sm" style={{ color: '#C9CBD6' }}>
          Step 3 keeps the preliminary category unchanged when extra-regional influence is unknown, 
          the population is isolated, or the category cannot be adjusted (EX, EW, DD, NA, NE, RE).
        </p>
      </div>
    </div>
  );
}
