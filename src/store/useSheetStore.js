import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleData } from '../data/sampleData';

const useSheetStore = create(
  persist(
    (set, get) => ({
      topics: sampleData,
      searchQuery: '',
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,

      // Search
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Get filtered topics based on search
      getFilteredTopics: () => {
        const { topics, searchQuery } = get();
        if (!searchQuery.trim()) return topics;

        const query = searchQuery.toLowerCase();
        return topics
          .map((topic) => ({
            ...topic,
            subTopics: topic.subTopics
              .map((subTopic) => ({
                ...subTopic,
                questions: subTopic.questions.filter(
                  (q) =>
                    q.text.toLowerCase().includes(query) ||
                    subTopic.title.toLowerCase().includes(query) ||
                    topic.title.toLowerCase().includes(query)
                ),
              }))
              .filter((subTopic) => subTopic.questions.length > 0),
          }))
          .filter((topic) => topic.subTopics.length > 0);
      },

      // Statistics
      getStatistics: () => {
        const { topics } = get();
        let totalQuestions = 0;
        let completedQuestions = 0;

        topics.forEach((topic) => {
          topic.subTopics.forEach((subTopic) => {
            totalQuestions += subTopic.questions.length;
            completedQuestions += subTopic.questions.filter((q) => q.completed).length;
          });
        });

        return {
          totalTopics: topics.length,
          totalSubTopics: topics.reduce((sum, topic) => sum + topic.subTopics.length, 0),
          totalQuestions,
          completedQuestions,
          progress: totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0,
        };
      },

      // History management
      saveToHistory: () => {
        const { topics, history, historyIndex, maxHistorySize } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(topics)));

        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          set({
            topics: JSON.parse(JSON.stringify(history[historyIndex - 1])),
            historyIndex: historyIndex - 1,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          set({
            topics: JSON.parse(JSON.stringify(history[historyIndex + 1])),
            historyIndex: historyIndex + 1,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Topic CRUD
      addTopic: (topic) => {
        get().saveToHistory();
        set((state) => ({
          topics: [...state.topics, { ...topic, id: `topic-${Date.now()}`, createdAt: new Date().toISOString() }],
        }));
      },

      updateTopic: (topicId, updates) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId ? { ...topic, ...updates } : topic
          ),
        }));
      },

      deleteTopic: (topicId) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.filter((topic) => topic.id !== topicId),
        }));
      },

      reorderTopics: (newOrder) => {
        get().saveToHistory();
        set({ topics: newOrder });
      },

      // SubTopic CRUD
      addSubTopic: (topicId, subTopic) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: [
                    ...topic.subTopics,
                    { ...subTopic, id: `sub-${Date.now()}`, createdAt: new Date().toISOString(), questions: [] },
                  ],
                }
              : topic
          ),
        }));
      },

      updateSubTopic: (topicId, subTopicId, updates) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((subTopic) =>
                    subTopic.id === subTopicId ? { ...subTopic, ...updates } : subTopic
                  ),
                }
              : topic
          ),
        }));
      },

      deleteSubTopic: (topicId, subTopicId) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.filter((subTopic) => subTopic.id !== subTopicId),
                }
              : topic
          ),
        }));
      },

      reorderSubTopics: (topicId, newOrder) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId ? { ...topic, subTopics: newOrder } : topic
          ),
        }));
      },

      // Question CRUD
      addQuestion: (topicId, subTopicId, question) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((subTopic) =>
                    subTopic.id === subTopicId
                      ? {
                          ...subTopic,
                          questions: [
                            ...subTopic.questions,
                            {
                              ...question,
                              id: `q-${Date.now()}`,
                              createdAt: new Date().toISOString(),
                              completed: false,
                            },
                          ],
                        }
                      : subTopic
                  ),
                }
              : topic
          ),
        }));
      },

      updateQuestion: (topicId, subTopicId, questionId, updates) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((subTopic) =>
                    subTopic.id === subTopicId
                      ? {
                          ...subTopic,
                          questions: subTopic.questions.map((question) =>
                            question.id === questionId ? { ...question, ...updates } : question
                          ),
                        }
                      : subTopic
                  ),
                }
              : topic
          ),
        }));
      },

      deleteQuestion: (topicId, subTopicId, questionId) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((subTopic) =>
                    subTopic.id === subTopicId
                      ? {
                          ...subTopic,
                          questions: subTopic.questions.filter((question) => question.id !== questionId),
                        }
                      : subTopic
                  ),
                }
              : topic
          ),
        }));
      },

      toggleQuestionComplete: (topicId, subTopicId, questionId) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((subTopic) =>
                    subTopic.id === subTopicId
                      ? {
                          ...subTopic,
                          questions: subTopic.questions.map((question) =>
                            question.id === questionId
                              ? { ...question, completed: !question.completed }
                              : question
                          ),
                        }
                      : subTopic
                  ),
                }
              : topic
          ),
        }));
      },

      reorderQuestions: (topicId, subTopicId, newOrder) => {
        get().saveToHistory();
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((subTopic) =>
                    subTopic.id === subTopicId ? { ...subTopic, questions: newOrder } : subTopic
                  ),
                }
              : topic
          ),
        }));
      },

      // Export/Import
      exportData: () => {
        const { topics } = get();
        return JSON.stringify({ topics }, null, 2);
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (data.topics && Array.isArray(data.topics)) {
            get().saveToHistory();
            set({ topics: data.topics });
            return { success: true };
          }
          return { success: false, error: 'Invalid data format' };
        } catch (error) {
          return { success: false, error: 'Invalid JSON' };
        }
      },

      resetData: () => {
        get().saveToHistory();
        set({ topics: sampleData });
      },
    }),
    {
      name: 'codolio-question-sheet', // localStorage key
      partialize: (state) => ({ 
        topics: state.topics 
      }), // Only persist topics, not search or history
    }
  )
);

export { useSheetStore };