import { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { useToastStore } from './Toast';
import { X, FileDown, FileJson, FileText, Loader } from 'lucide-react';

const ExportModal = ({ onClose }) => {
  const { exportData, topics, getStatistics } = useSheetStore();
  const { addToast } = useToastStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExportJSON = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codolio-question-sheet-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('JSON exported successfully', 'success');
      onClose();
    } catch (error) {
      addToast('Failed to export JSON', 'error');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const stats = getStatistics();
      
      // Create HTML content for PDF
      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Question Sheet - Codolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #ffffff;
      padding: 40px;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-card h3 {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card p {
      font-size: 28px;
      font-weight: 700;
      color: #6366f1;
    }
    .topic {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      page-break-inside: avoid;
    }
    .topic-header {
      border-bottom: 3px solid #6366f1;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .topic-title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .topic-meta {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #64748b;
    }
    .subtopic {
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 6px;
    }
    .subtopic-title {
      font-size: 18px;
      font-weight: 600;
      color: #6366f1;
      margin-bottom: 15px;
    }
    .question {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 6px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .question-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid #cbd5e1;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .question-checkbox.completed {
      background: #10b981;
      border-color: #10b981;
      position: relative;
    }
    .question-checkbox.completed::after {
      content: '✓';
      color: white;
      font-size: 14px;
      position: absolute;
      top: -2px;
      left: 2px;
    }
    .question-content {
      flex: 1;
    }
    .question-text {
      font-size: 15px;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .question-text.completed {
      text-decoration: line-through;
      color: #64748b;
    }
    .question-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #64748b;
    }
    .difficulty {
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
    }
    .difficulty.easy { background: #dcfce7; color: #166534; }
    .difficulty.medium { background: #fef3c7; color: #92400e; }
    .difficulty.hard { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 4px;
    }
    @media print {
      body { padding: 20px; }
      .topic { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 Question Sheet - Codolio</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <h3>Total Topics</h3>
      <p>${stats.totalTopics}</p>
    </div>
    <div class="stat-card">
      <h3>Sub-topics</h3>
      <p>${stats.totalSubTopics}</p>
    </div>
    <div class="stat-card">
      <h3>Questions</h3>
      <p>${stats.totalQuestions}</p>
    </div>
    <div class="stat-card">
      <h3>Completed</h3>
      <p>${stats.completedQuestions}</p>
    </div>
  </div>

  <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="font-size: 16px; color: #64748b;">Overall Progress</h3>
      <span style="font-size: 20px; font-weight: 700; color: #6366f1;">${stats.progress.toFixed(1)}%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${stats.progress}%;"></div>
    </div>
  </div>
`;

      // Add topics
      topics.forEach(topic => {
        const topicQuestions = topic.subTopics.reduce((sum, sub) => sum + sub.questions.length, 0);
        const topicCompleted = topic.subTopics.reduce((sum, sub) => 
          sum + sub.questions.filter(q => q.completed).length, 0);
        const topicProgress = topicQuestions > 0 ? (topicCompleted / topicQuestions * 100) : 0;

        htmlContent += `
  <div class="topic">
    <div class="topic-header">
      <div class="topic-title">${topic.title}</div>
      <div class="topic-meta">
        <span>${topic.subTopics.length} sub-topics</span>
        <span>${topicCompleted}/${topicQuestions} completed</span>
        <span>${topicProgress.toFixed(0)}% progress</span>
      </div>
    </div>
`;

        topic.subTopics.forEach(subTopic => {
          htmlContent += `
    <div class="subtopic">
      <div class="subtopic-title">${subTopic.title}</div>
`;

          subTopic.questions.forEach(question => {
            htmlContent += `
      <div class="question">
        <div class="question-checkbox ${question.completed ? 'completed' : ''}"></div>
        <div class="question-content">
          <div class="question-text ${question.completed ? 'completed' : ''}">${question.text}</div>
          <div class="question-meta">
            ${question.difficulty ? `<span class="difficulty ${question.difficulty.toLowerCase()}">${question.difficulty}</span>` : ''}
            ${question.createdAt ? `<span>Added: ${new Date(question.createdAt).toLocaleDateString()}</span>` : ''}
          </div>
        </div>
      </div>
`;
          });

          htmlContent += `
    </div>
`;
        });

        htmlContent += `
  </div>
`;
      });

      htmlContent += `
  <div class="footer">
    <p><strong>Codolio Question Sheet</strong></p>
    <p>Track and manage your coding questions • codolio.com</p>
    <p style="margin-top: 8px; font-size: 12px;">Built with ❤️ for developers</p>
  </div>
</body>
</html>
`;

      // Save HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codolio-question-sheet-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast('HTML file generated! Open it in browser and use Print to PDF', 'success', 5000);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      addToast('Failed to export PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'json') {
      handleExportJSON();
    } else {
      handleExportPDF();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-md w-full border-2 border-primary/30 shadow-2xl neon-glow">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileDown className="w-6 h-6 text-primary" />
              Export Your Sheet
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surfaceHover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted hover:text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Choose Export Format
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  exportFormat === 'pdf'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-surfaceHover'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className={`w-6 h-6 mt-0.5 ${
                    exportFormat === 'pdf' ? 'text-primary' : 'text-muted'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      exportFormat === 'pdf' ? 'text-primary' : 'text-white'
                    }`}>
                      PDF / HTML Document
                    </div>
                    <div className="text-sm text-muted mt-1">
                      Beautiful formatted document ready for printing or sharing
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('json')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  exportFormat === 'json'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-surfaceHover'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileJson className={`w-6 h-6 mt-0.5 ${
                    exportFormat === 'json' ? 'text-primary' : 'text-muted'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      exportFormat === 'json' ? 'text-primary' : 'text-white'
                    }`}>
                      JSON Data File
                    </div>
                    <div className="text-sm text-muted mt-1">
                      Raw data for backup or import into other systems
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">What's included:</h4>
            <ul className="text-sm text-muted space-y-1">
              <li>✓ All topics and sub-topics</li>
              <li>✓ Complete question list with status</li>
              <li>✓ Progress statistics</li>
              <li>✓ Difficulty levels and metadata</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-surfaceHover hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-3 bg-primary hover:bg-accent text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 neon-glow"
          >
            {isExporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;