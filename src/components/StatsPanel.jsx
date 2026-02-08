import { useSheetStore } from '../store/useSheetStore';
import { X, TrendingUp, Target, CheckCircle2, AlertCircle } from 'lucide-react';

const StatsPanel = ({ onClose }) => {
  const { getStatistics, topics } = useSheetStore();
  const stats = getStatistics();

  // Calculate additional insights
  const getTopicInsights = () => {
    return topics.map(topic => {
      const totalQuestions = topic.subTopics.reduce(
        (sum, sub) => sum + sub.questions.length,
        0
      );
      const completedQuestions = topic.subTopics.reduce(
        (sum, sub) => sum + sub.questions.filter(q => q.completed).length,
        0
      );
      const progress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

      return {
        title: topic.title,
        total: totalQuestions,
        completed: completedQuestions,
        progress: progress,
      };
    }).sort((a, b) => b.progress - a.progress);
  };

  const topicInsights = getTopicInsights();
  const topPerformer = topicInsights[0];
  const needsAttention = topicInsights.filter(t => t.progress < 50);

  return (
    <div className="glass border-2 border-primary/20 rounded-2xl p-6 mb-8 shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          📊 Progress Analytics
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surfaceHover rounded-lg transition-colors"
          title="Close stats panel"
        >
          <X className="w-5 h-5 text-muted hover:text-white" />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border-2 border-primary/20 rounded-xl p-4 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Total Progress</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.progress.toFixed(1)}%
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-surface border-2 border-accent/20 rounded-xl p-4 hover:border-accent/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Completion Rate</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.completedQuestions}/{stats.totalQuestions}
          </div>
          <div className="text-xs text-muted mt-1">
            {stats.totalQuestions - stats.completedQuestions} remaining
          </div>
        </div>

        <div className="bg-surface border-2 border-success/20 rounded-xl p-4 hover:border-success/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Topics Coverage</span>
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.totalTopics}
          </div>
          <div className="text-xs text-muted mt-1">
            {stats.totalSubTopics} sub-topics total
          </div>
        </div>

        <div className="bg-surface border-2 border-border rounded-xl p-4 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Needs Attention</span>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {needsAttention.length}
          </div>
          <div className="text-xs text-muted mt-1">
            topics below 50%
          </div>
        </div>
      </div>

      {/* Top Performer */}
      {topPerformer && topPerformer.total > 0 && (
        <div className="bg-gradient-to-r from-success/10 to-transparent border-2 border-success/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-success">Top Performing Topic</h3>
              <p className="text-xs text-muted">You're crushing it here! 🎉</p>
            </div>
          </div>
          <div className="ml-11">
            <p className="text-lg font-bold text-white">{topPerformer.title}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-300"
                  style={{ width: `${topPerformer.progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-success">
                {topPerformer.progress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Topic Breakdown */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Topic Breakdown
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {topicInsights.map((topic, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {topic.title}
                </span>
                <span className="text-xs text-muted">
                  {topic.completed}/{topic.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      topic.progress >= 75
                        ? 'bg-success'
                        : topic.progress >= 50
                        ? 'bg-accent'
                        : topic.progress >= 25
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400 min-w-[40px] text-right">
                  {topic.progress.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      {stats.progress > 0 && (
        <div className="mt-6 p-4 glass border border-primary/20 rounded-xl">
          <p className="text-sm text-center text-slate-300">
            {stats.progress < 25 && "🚀 Great start! Keep the momentum going!"}
            {stats.progress >= 25 && stats.progress < 50 && "💪 You're making solid progress! Keep it up!"}
            {stats.progress >= 50 && stats.progress < 75 && "🔥 Halfway there! You're doing amazing!"}
            {stats.progress >= 75 && stats.progress < 100 && "⭐ Almost there! The finish line is in sight!"}
            {stats.progress === 100 && "🎉 Perfect score! You've mastered everything!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;