import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleData } from '../data/sampleData';

export const useSheetStore = create(
  persist(
    (set, get) => ({
      // State
      topics: sampleData,
      searchQuery: '',
      filter: 'all', // 'all', 'completed', 'pending'
      history: [],
      historyIndex: -1,
      
      // Search & Filter
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilter: (filter) => set({ filter }),

      // Topic Operations
      addTopic: (title) => {
        const newTopic = {
          id: `topic-${Date.now()}`,
          title,
          subTopics: [],
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          const newTopics = [...state.topics, newTopic];
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        });
      },

      editTopic: (topicId, newTitle) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId ? { ...topic, title: newTitle } : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      deleteTopic: (topicId) =>
        set((state) => {
          const newTopics = state.topics.filter((t) => t.id !== topicId);
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      reorderTopics: (newOrder) =>
        set((state) => {
          get().saveToHistory(newOrder);
          return { topics: newOrder };
        }),

      // SubTopic Operations
      addSubTopic: (topicId, title) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: [
                    ...topic.subTopics,
                    {
                      id: `sub-${Date.now()}`,
                      title,
                      questions: [],
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      editSubTopic: (topicId, subTopicId, newTitle) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId ? { ...sub, title: newTitle } : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      deleteSubTopic: (topicId, subTopicId) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.filter((s) => s.id !== subTopicId),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      reorderSubTopics: (topicId, newOrder) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId ? { ...topic, subTopics: newOrder } : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      // Question Operations
      addQuestion: (topicId, subTopicId, text) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId
                      ? {
                          ...sub,
                          questions: [
                            ...sub.questions,
                            {
                              id: `q-${Date.now()}`,
                              text,
                              completed: false,
                              createdAt: new Date().toISOString(),
                            },
                          ],
                        }
                      : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      editQuestion: (topicId, subTopicId, questionId, newText) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId
                      ? {
                          ...sub,
                          questions: sub.questions.map((q) =>
                            q.id === questionId ? { ...q, text: newText } : q
                          ),
                        }
                      : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      deleteQuestion: (topicId, subTopicId, questionId) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId
                      ? {
                          ...sub,
                          questions: sub.questions.filter(
                            (q) => q.id !== questionId
                          ),
                        }
                      : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      toggleQuestionComplete: (topicId, subTopicId, questionId) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId
                      ? {
                          ...sub,
                          questions: sub.questions.map((q) =>
                            q.id === questionId
                              ? { ...q, completed: !q.completed }
                              : q
                          ),
                        }
                      : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      reorderQuestions: (topicId, subTopicId, newOrder) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId ? { ...sub, questions: newOrder } : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      // Bulk Operations
      deleteMultipleQuestions: (topicId, subTopicId, questionIds) =>
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  subTopics: topic.subTopics.map((sub) =>
                    sub.id === subTopicId
                      ? {
                          ...sub,
                          questions: sub.questions.filter(
                            (q) => !questionIds.includes(q.id)
                          ),
                        }
                      : sub
                  ),
                }
              : topic
          );
          get().saveToHistory(newTopics);
          return { topics: newTopics };
        }),

      // History Management (Undo/Redo)
      saveToHistory: (newTopics) => {
        set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newTopics)));
          
          // Keep only last 50 states
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () =>
        set((state) => {
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            return {
              topics: state.history[newIndex],
              historyIndex: newIndex,
            };
          }
          return state;
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            return {
              topics: state.history[newIndex],
              historyIndex: newIndex,
            };
          }
          return state;
        }),

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Import/Export
      exportData: () => {
        const data = {
          topics: get().topics,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        };
        return JSON.stringify(data, null, 2);
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (data.topics && Array.isArray(data.topics)) {
            set({ topics: data.topics });
            get().saveToHistory(data.topics);
            return { success: true };
          }
          return { success: false, error: 'Invalid data format' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Statistics
      getStatistics: () => {
        const topics = get().topics;
        let totalQuestions = 0;
        let completedQuestions = 0;

        topics.forEach((topic) => {
          topic.subTopics.forEach((sub) => {
            totalQuestions += sub.questions.length;
            completedQuestions += sub.questions.filter((q) => q.completed).length;
          });
        });

        return {
          totalTopics: topics.length,
          totalSubTopics: topics.reduce((sum, t) => sum + t.subTopics.length, 0),
          totalQuestions,
          completedQuestions,
          progress: totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0,
        };
      },

      // Reset
      resetData: () => set({ topics: sampleData, history: [], historyIndex: -1 }),
    }),
    {
      name: 'sheet-storage',
      version: 1,
    }
  )
);