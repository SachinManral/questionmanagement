import { useMemo } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import TopicSection from './TopicSection';
import { Search } from 'lucide-react';

const SheetArea = () => {
  const { topics, searchQuery } = useSheetStore();

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;

    const query = searchQuery.toLowerCase();
    return topics
      .map((topic) => {
        const topicMatches = topic.title.toLowerCase().includes(query);

        const filteredSubTopics = topic.subTopics
          ?.map((sub) => {
            const subMatches = sub.title.toLowerCase().includes(query);

            const filteredQuestions = sub.questions?.filter((q) =>
              q.text.toLowerCase().includes(query) ||
              (q.difficulty && q.difficulty.toLowerCase().includes(query))
            );

            if (subMatches || (filteredQuestions && filteredQuestions.length > 0)) {
              return {
                ...sub,
                questions: filteredQuestions && filteredQuestions.length > 0 ? filteredQuestions : sub.questions,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (topicMatches || (filteredSubTopics && filteredSubTopics.length > 0)) {
          return {
            ...topic,
            subTopics: filteredSubTopics && filteredSubTopics.length > 0 ? filteredSubTopics : topic.subTopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [topics, searchQuery]);

  return (
    <div className="space-y-4">
      {filteredTopics.map((topic) => (
        <TopicSection key={topic.id} topic={topic} />
      ))}
      
      {filteredTopics.length === 0 && searchQuery && (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Search className="w-16 h-16 mx-auto text-muted mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">
            No results found
          </h3>
          <p className="text-muted">
            No results found for "<span className="text-accent">{searchQuery}</span>"
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Try adjusting your search query
          </p>
        </div>
      )}
      
      {filteredTopics.length === 0 && !searchQuery && (
        <div className="text-center py-20 bg-surface rounded-xl border-2 border-dashed border-border">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-slate-300 mb-2">
            No topics yet
          </h3>
          <p className="text-muted mb-6">
            Create your first topic to start organizing your coding questions
          </p>
        </div>
      )}
    </div>
  );
};

export default SheetArea;