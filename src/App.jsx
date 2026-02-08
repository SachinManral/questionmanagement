import { useState, useMemo } from 'react';
import { useSheetStore } from './store/useSheetStore';
import { useKeyboardShortcuts } from './hooks/UseCustomHooks';
import { ToastContainer } from './components/Toast';
import { useToastStore } from './components/Toast';
import Header from './components/Header';
import Topic from './components/Topic';
import StatsPanel from './components/StatsPanel';
import ExportModal from './components/ExportModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { 
  Plus, 
  Search as SearchIcon, 
  Keyboard,
  FileText,
  Sparkles,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

function App() {
  const { topics, addTopic, reorderTopics, searchQuery } = useSheetStore();
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Enable keyboard shortcuts (Undo/Redo)
  useKeyboardShortcuts();

  // Configure drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topics.findIndex((t) => t.id === active.id);
    const newIndex = topics.findIndex((t) => t.id === over.id);

    const newOrder = arrayMove(topics, oldIndex, newIndex);
    reorderTopics(newOrder);
    addToast('Topic reordered', 'info', 2000);
  };

  const handleAddTopic = () => {
    if (!title.trim()) {
      addToast('Please enter a topic name', 'warning');
      return;
    }
    addTopic(title.trim());
    setTitle('');
    addToast('Topic added successfully', 'success');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTopic();
    }
  };

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;

    const query = searchQuery.toLowerCase();
    return topics
      .map((topic) => {
        const topicMatches = topic.title.toLowerCase().includes(query);

        const filteredSubTopics = topic.subTopics
          .map((sub) => {
            const subMatches = sub.title.toLowerCase().includes(query);

            const filteredQuestions = sub.questions.filter((q) =>
              q.text.toLowerCase().includes(query) ||
              (q.difficulty && q.difficulty.toLowerCase().includes(query))
            );

            if (subMatches || filteredQuestions.length > 0) {
              return {
                ...sub,
                questions: filteredQuestions.length > 0 ? filteredQuestions : sub.questions,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (topicMatches || filteredSubTopics.length > 0) {
          return {
            ...topic,
            subTopics: filteredSubTopics.length > 0 ? filteredSubTopics : topic.subTopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [topics, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}

      {/* Header */}
      <Header onExportClick={() => setShowExportModal(true)} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Panel */}
        {showStats && <StatsPanel onClose={() => setShowStats(false)} />}

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass border-2 border-primary/20 rounded-xl p-4 hover:border-primary/40 transition-all card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-sm font-medium">Topics</p>
                <p className="text-3xl font-bold mt-1 text-white">{topics.length}</p>
              </div>
              <Target className="w-10 h-10 text-primary opacity-50" />
            </div>
          </div>
          
          <div className="glass border-2 border-accent/20 rounded-xl p-4 hover:border-accent/40 transition-all card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent text-sm font-medium">Sub-topics</p>
                <p className="text-3xl font-bold mt-1 text-white">
                  {topics.reduce((sum, t) => sum + t.subTopics.length, 0)}
                </p>
              </div>
              <Award className="w-10 h-10 text-accent opacity-50" />
            </div>
          </div>
          
          <div className="glass border-2 border-success/20 rounded-xl p-4 hover:border-success/40 transition-all card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-1 text-white">
                  {topics.reduce((sum, t) => 
                    sum + t.subTopics.reduce((s, sub) => 
                      s + sub.questions.filter(q => q.completed).length, 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-success opacity-50" />
            </div>
          </div>
          
          <div className="glass border-2 border-primary/20 rounded-xl p-4 hover:border-primary/40 transition-all card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-sm font-medium">Total Questions</p>
                <p className="text-3xl font-bold mt-1 text-white">
                  {topics.reduce((sum, t) => 
                    sum + t.subTopics.reduce((s, sub) => s + sub.questions.length, 0), 0)}
                </p>
              </div>
              <FileText className="w-10 h-10 text-primary opacity-50" />
            </div>
          </div>
        </div>

        {/* Add Topic Section */}
        <div className="glass p-6 rounded-2xl border-2 border-primary/30 mb-8 shadow-2xl neon-glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Create New Topic</h2>
          </div>
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter topic name (e.g., Dynamic Programming)..."
              className="flex-1 px-5 py-3 bg-surface border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg transition-all text-white placeholder-muted"
              autoFocus
            />
            <button
              onClick={handleAddTopic}
              className="px-8 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg hover:shadow-primary/50 transition-all neon-glow"
            >
              <Plus className="w-5 h-5" />
              Add Topic
            </button>
          </div>
          <p className="mt-3 text-sm text-muted flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Press <kbd className="px-2 py-1 bg-surface border-2 border-border rounded text-xs font-mono text-primary">Enter</kbd> to quickly add a topic
          </p>
        </div>

        {/* Topics List */}
        {filteredTopics.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTopics.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {filteredTopics.map((topic) => (
                  <Topic key={topic.id} topic={topic} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : searchQuery ? (
          <div className="text-center py-20 glass rounded-2xl border-2 border-border">
            <SearchIcon className="w-20 h-20 mx-auto text-muted mb-4" />
            <h3 className="text-2xl font-bold text-slate-300 mb-2">
              No results found
            </h3>
            <p className="text-muted mb-6">
              Try adjusting your search query or create a new topic
            </p>
            <button
              onClick={() => document.querySelector('input').focus()}
              className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-lg font-medium transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl border-2 border-dashed border-border">
            <FileText className="w-24 h-24 mx-auto text-muted mb-4" />
            <h3 className="text-2xl font-bold text-slate-300 mb-2">
              No topics yet
            </h3>
            <p className="text-muted mb-6">
              Create your first topic to start organizing your questions!
            </p>
            <button
              onClick={() => document.querySelector('input').focus()}
              className="px-8 py-3 bg-primary hover:bg-accent text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-primary/50 transition-all neon-glow"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Your First Topic
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="mt-12 p-5 glass border-2 border-primary/30 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-primary">Keyboard Shortcuts</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-surface rounded-lg border-2 border-border font-mono text-xs text-primary">Ctrl+Z</kbd>
              <span>Undo</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-surface rounded-lg border-2 border-border font-mono text-xs text-primary">Ctrl+Shift+Z</kbd>
              <span>Redo</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-surface rounded-lg border-2 border-border font-mono text-xs text-primary">Enter</kbd>
              <span>Save/Add</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-surface rounded-lg border-2 border-border font-mono text-xs text-primary">Esc</kbd>
              <span>Cancel</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted space-y-2">
          <p className="font-medium text-slate-400">
            Built with React, Zustand, dnd-kit, Tailwind CSS & Lucide Icons
          </p>
          <p className="flex items-center justify-center gap-2 text-muted">
            <span className="text-primary">✨</span>
            <span>Drag and drop to reorder</span>
            <span>•</span>
            <span>Click to edit</span>
            <span>•</span>
            <span>All changes auto-saved</span>
            <span className="text-primary">✨</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;