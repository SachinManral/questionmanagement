import { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { useToastStore } from './Toast';
import { fetchAndImportSheet } from '../services/api';
import { Search, Undo2, Redo2, Download, Upload, RotateCcw, FileDown } from 'lucide-react';

const Header = ({ onExportClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { searchQuery, setSearchQuery, exportData, importData, resetData, canUndo, canRedo, undo, redo } = useSheetStore();
  const { getStatistics } = useSheetStore();
  const { addToast } = useToastStore();
  const stats = getStatistics();

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = importData(e.target.result);
        if (result.success) {
          addToast('Data imported successfully', 'success');
        } else {
          addToast(result.error || 'Failed to import data', 'error');
        }
      } catch (error) {
        addToast('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleImportFromAPI = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Starting API import...");
      const result = await fetchAndImportSheet('striver-sde-sheet');
      
      console.log("📦 Import result:", result);
      
      if (result.success && result.data) {
        // The data is already transformed to array format by the API
        // Now we need to pass it to the store's importData function
        const jsonString = JSON.stringify({ topics: result.data });
        const importResult = importData(jsonString);
        
        if (importResult.success) {
          addToast(`Sheet imported successfully! Loaded ${result.data.length} topics`, 'success', 4000);
          console.log("✅ Import complete");
        } else {
          addToast('Failed to import data', 'error');
          console.error("❌ Import failed:", importResult.error);
        }
      } else {
        addToast('Failed to fetch from API', 'error');
        console.error("❌ API fetch failed");
      }
    } catch (error) {
      console.error("❌ Import error:", error);
      addToast('Error importing from API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetData();
      addToast('Data reset to default', 'info');
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur-md border-b-2 border-primary/30 shadow-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              Codolio Question Sheet
            </h1>
            <p className="text-sm text-muted">
              Track and master your coding interview preparation
            </p>
          </div>
          
          {/* Statistics Cards */}
          <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-lg border border-primary/20">
              <div className="text-xs text-primary font-medium">Topics</div>
              <div className="text-2xl font-bold text-white">{stats.totalTopics}</div>
            </div>
            <div className="glass px-4 py-2 rounded-lg border border-accent/20">
              <div className="text-xs text-accent font-medium">Sub-topics</div>
              <div className="text-2xl font-bold text-white">{stats.totalSubTopics}</div>
            </div>
            <div className="glass px-4 py-2 rounded-lg border border-success/20">
              <div className="text-xs text-success font-medium">Questions</div>
              <div className="text-2xl font-bold text-white">
                {stats.completedQuestions}/{stats.totalQuestions}
              </div>
            </div>
            <div className="glass px-4 py-2 rounded-lg border border-primary/20">
              <div className="text-xs text-primary font-medium">Progress</div>
              <div className="text-2xl font-bold text-white">
                {stats.progress.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, sub-topics, or questions..."
              className="w-full pl-10 pr-4 py-2 bg-surface border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-muted transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1 border-2 border-border rounded-lg overflow-hidden bg-surface">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="px-3 py-2 hover:bg-surfaceHover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="px-3 py-2 hover:bg-surfaceHover disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l-2 border-border text-white"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onExportClick}
            className="px-4 py-2 bg-primary hover:bg-accent text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-primary/50 flex items-center gap-2 neon-glow"
          >
            <FileDown className="w-4 h-4" />
            Export
          </button>

          <label className="px-4 py-2 bg-success hover:bg-emerald-600 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-success/50 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleImportFromAPI}
            disabled={isLoading}
            className="px-4 py-2 bg-accent hover:bg-primary text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-accent/50 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Load Sample
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-surfaceHover hover:bg-slate-600 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
            title="Reset to default data"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;