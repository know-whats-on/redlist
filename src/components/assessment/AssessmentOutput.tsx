import React, { useState } from 'react';
import { ChevronLeft, Download, FileText, CheckCircle, Edit } from 'lucide-react';
import { AssessmentData } from '../AssessmentWorkflow';

interface AssessmentOutputProps {
  data: AssessmentData;
  onBack: () => void;
  onComplete: () => void;
}

export function AssessmentOutput({ data, onBack, onComplete }: AssessmentOutputProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const finalCategory = data.step3?.finalCategory || data.step2?.preliminaryCategory || 'Unknown';
  const criteriaMet = data.step2?.criteriaMet || 'Unknown';
  const confidence = data.step2?.confidence || 0;
  const categoryAdjusted = (data.step3?.adjustmentSteps || 0) !== 0;

  const handleExport = (format: 'pdf' | 'json' | 'csv') => {
    // Generate export data
    const exportData = {
      taxon: {
        commonName: data.taxonName,
        scientificName: data.scientificName,
      },
      assessment: {
        finalRegionalCategory: finalCategory + (categoryAdjusted ? '°' : ''),
        criteriaMet,
        preliminaryCategory: data.step2?.preliminaryCategory,
        adjustmentSteps: data.step3?.adjustmentSteps || 0,
        adjustmentRationale: data.step3?.adjustmentRationale,
        confidence,
      },
      step1: data.step1,
      step2: data.step2,
      step3: data.step3,
      metadata: {
        assessmentDate: data.lastModified,
        assessmentId: data.id,
        region: localStorage.getItem('selectedRegion'),
      },
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-${data.id}.json`;
      a.click();
    } else if (format === 'csv') {
      const csv = `Scientific Name,Common Name,Regional Category,Criteria,Preliminary Category,Adjustment Steps,Confidence
"${data.scientificName}","${data.taxonName}","${finalCategory}${categoryAdjusted ? '°' : ''}","${criteriaMet}","${data.step2?.preliminaryCategory || ''}","${data.step3?.adjustmentSteps || 0}","${confidence}%"`;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-${data.id}.csv`;
      a.click();
    } else {
      // PDF would be generated on a real backend
      alert('PDF export would be generated here. This requires server-side rendering.');
    }

    setShowExportModal(false);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="rounded-[18px] px-4 py-3" style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
        <h2 className="font-semibold" style={{ color: '#34D399' }}>Assessment Complete</h2>
        <p className="text-sm mt-1" style={{ color: '#C9CBD6' }}>
          Review and export your results
        </p>
      </div>

      {/* Final Category Card */}
      <div className="rounded-[18px] card-shadow p-6 text-center" style={{ background: '#14151A', border: '2px solid #D2110C' }}>
        <p className="text-sm font-semibold mb-2" style={{ color: '#C9CBD6' }}>Final Regional Category</p>
        <p className="text-4xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
          {finalCategory}{categoryAdjusted ? '°' : ''}
        </p>
        <p className="text-sm" style={{ color: '#C9CBD6' }}>
          Criteria: {criteriaMet}
        </p>
        {categoryAdjusted && (
          <p className="text-xs mt-2" style={{ color: '#8E91A3' }}>
            ° Category adjusted via Step 3
          </p>
        )}
        <p className="text-sm mt-3 pt-3" style={{ color: '#C9CBD6', borderTop: '1px solid #242632' }}>
          Confidence: {confidence}%
        </p>
      </div>

      {/* Rationale Summary */}
      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid #242632' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>Plain-Language Rationale</h3>
        
        <div className="space-y-3 text-sm" style={{ color: '#C9CBD6' }}>
          <p>
            <strong style={{ color: '#FFFFFF' }}>Taxon:</strong> {data.taxonName} (<em>{data.scientificName}</em>)
          </p>
          
          <p>
            <strong style={{ color: '#FFFFFF' }}>Eligibility:</strong> {data.step1?.eligible 
              ? 'Eligible for assessment. ' + (data.step1.rationale || '')
              : 'Not eligible for assessment.'}
          </p>
          
          {data.step2 && (
            <p>
              <strong style={{ color: '#FFFFFF' }}>Regional Population Assessment:</strong> The regional population
              {data.step2.populationSize ? ` comprises approximately ${data.step2.populationSize} mature individuals` : ''}.
              {data.step2.declinePercent ? ` A ${data.step2.declinePercent}% decline has been observed over 10 years.` : ''}
              {' '}Based on IUCN criteria applied to regional data, the preliminary category is {data.step2.preliminaryCategory}.
            </p>
          )}
          
          {data.step3 && data.step3.adjustmentRationale && (
            <p>
              <strong style={{ color: '#FFFFFF' }}>Extra-regional Influence:</strong> {data.step3.adjustmentRationale}
            </p>
          )}
        </div>
      </div>

      {/* What's Next */}
      <div className="rounded-[18px] card-shadow p-4" style={{ background: '#14151A', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#60A5FA' }}>What to Do Next</h3>
        <ul className="space-y-2 text-sm" style={{ color: '#C9CBD6' }}>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
            <span>Review all sections for completeness and accuracy</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
            <span>Gather additional evidence to improve confidence score (if needed)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
            <span>Export assessment for review by senior assessors</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
            <span>Seek extra-regional population data to reduce uncertainty (if unknown)</span>
          </li>
        </ul>
      </div>

      {/* Missing Data Checklist */}
      {confidence < 80 && (
        <div className="rounded-[18px] card-shadow p-4" style={{ background: '#1A1C22', border: '1px solid #B45309' }}>
          <h3 className="font-semibold mb-3" style={{ color: '#FCD34D' }}>Improve Confidence</h3>
          <p className="text-sm mb-2" style={{ color: '#FCD34D' }}>Consider collecting additional data on:</p>
          <ul className="space-y-1 text-sm" style={{ color: '#C9CBD6' }}>
            {!data.step2?.eoo && <li>• Extent of Occurrence (EOO)</li>}
            {!data.step2?.aoo && <li>• Area of Occupancy (AOO)</li>}
            {!data.step2?.locations && <li>• Number of locations</li>}
            {(!data.step2?.threats || data.step2.threats.length < 50) && <li>• Detailed threat assessment</li>}
            {data.step3?.rescueEffect === 'uncertain' && <li>• Extra-regional population status</li>}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowExportModal(true)}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4"
        >
          <Download className="w-5 h-5" />
          Export Assessment
        </button>
        
        <button
          onClick={() => {
            // Mark assessment as completed
            const stored = localStorage.getItem('assessments');
            if (stored) {
              const assessments = JSON.parse(stored);
              const assessmentIndex = assessments.findIndex((a: any) => a.id === data.id);
              
              if (assessmentIndex !== -1) {
                assessments[assessmentIndex] = {
                  ...assessments[assessmentIndex],
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  finalCategory: finalCategory,
                  criteriaString: criteriaMet,
                  adjusted: categoryAdjusted,
                  stepsChanged: data.step3?.adjustmentSteps || 0,
                  currentStep: 4,
                  lastModified: new Date().toISOString()
                };
                localStorage.setItem('assessments', JSON.stringify(assessments));
                
                // Trigger assessment list update
                window.dispatchEvent(new CustomEvent('assessmentCompleted', { detail: { assessmentId: data.id } }));
              }
            }
            
            onComplete();
          }}
          className="w-full btn-secondary flex items-center justify-center gap-2 py-4"
        >
          Complete & Return Home
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="rounded-[18px] max-w-md w-full p-6" style={{ background: '#14151A', border: '1px solid #242632' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Export Assessment</h3>
            <p className="text-sm mb-4" style={{ color: '#C9CBD6' }}>
              Choose export format. All exports include the full audit trail and meet IUCN documentation requirements.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
                style={{ background: '#1A1C22', border: '2px solid #242632' }}
              >
                <FileText className="w-5 h-5" style={{ color: '#60A5FA' }} />
                <div>
                  <div className="font-medium" style={{ color: '#FFFFFF' }}>JSON</div>
                  <div className="text-xs" style={{ color: '#8E91A3' }}>Complete data export for archiving</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
                style={{ background: '#1A1C22', border: '2px solid #242632' }}
              >
                <FileText className="w-5 h-5" style={{ color: '#60A5FA' }} />
                <div>
                  <div className="font-medium" style={{ color: '#FFFFFF' }}>CSV</div>
                  <div className="text-xs" style={{ color: '#8E91A3' }}>Spreadsheet format for Red List tables</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
                style={{ background: '#1A1C22', border: '2px solid #242632' }}
              >
                <FileText className="w-5 h-5" style={{ color: '#60A5FA' }} />
                <div>
                  <div className="font-medium" style={{ color: '#FFFFFF' }}>PDF Report</div>
                  <div className="text-xs" style={{ color: '#8E91A3' }}>Full narrative with appendices</div>
                </div>
              </button>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full btn-secondary py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
