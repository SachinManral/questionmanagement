const API_BASE_URL = 'https://node.codolio.com/api/question-tracker/v1';

class SheetAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async fetchSheetBySlug(slug = 'striver-sde-sheet') {
    // Check cache first
    const cachedData = this.getFromCache(slug);
    if (cachedData) {
      console.log("✅ Serving from cache");
      return { success: true, data: cachedData, cached: true };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/sheet/public/get-sheet-by-slug/${slug}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const rawData = result.data || result; // Handle API wrapping

      console.log("📦 Raw API Data:", rawData);
      
      // Debug logging to understand the structure
      if (rawData.sheet) {
        console.log("📋 Sheet structure:", rawData.sheet);
        console.log("📋 Sheet keys:", Object.keys(rawData.sheet));
      }
      if (rawData.questions) {
        console.log("📋 Questions count:", rawData.questions?.length);
      }

      // Cache the raw response
      this.setInCache(slug, rawData);
      
      return { success: true, data: rawData, cached: false };
    } catch (error) {
      console.error('❌ Error fetching sheet:', error);
      return { 
        success: false, 
        error: error.message,
        fallback: true 
      };
    }
  }

  // 🔥 CRITICAL FIX: Transform API data from flat questions array to nested structure
  // Your store expects: [{ id, title, subTopics: [{ id, title, questions: [...] }] }]
  transformAPIData(apiData) {
    console.log("🔄 Transforming API data...");
    
    // The API returns a flat array of questions with Topic and Sub_Topic fields
    const questionsArray = apiData?.questions || [];

    if (!questionsArray.length) {
      console.warn("⚠️ No questions found in API response");
      console.log("📋 Available root keys:", Object.keys(apiData || {}));
      
      if (apiData?.sheet) {
        console.log("📋 Sheet keys:", Object.keys(apiData.sheet));
      }
      
      return [];
    }

    console.log(`📊 Processing ${questionsArray.length} questions...`);
    
    // Debug: Log the first question to see its structure
    if (questionsArray.length > 0) {
      console.log("🔍 First question structure:", questionsArray[0]);
      console.log("🔍 First question keys:", Object.keys(questionsArray[0]));
    }

    // Group questions by Topic and Sub_Topic
    const topicsMap = new Map();

    questionsArray.forEach((question, qIndex) => {
      // Try different possible field names for topic and subtopic
      const topicName = question.Topic || 
                        question.topic || 
                        question.topicName || 
                        question.category || 
                        question.Category ||
                        'Uncategorized';
      
      const subTopicName = question.Sub_Topic || 
                           question.sub_topic || 
                           question.subTopic || 
                           question.subTopicName || 
                           question.subcategory ||
                           'General';

      // Get or create topic
      if (!topicsMap.has(topicName)) {
        topicsMap.set(topicName, {
          title: topicName,
          subTopics: new Map(),
        });
      }
      const topic = topicsMap.get(topicName);

      // Get or create subtopic
      if (!topic.subTopics.has(subTopicName)) {
        topic.subTopics.set(subTopicName, {
          title: subTopicName,
          questions: [],
        });
      }
      const subTopic = topic.subTopics.get(subTopicName);

      // Add question to subtopic
      subTopic.questions.push({
        id: question._id || question.id || `q-${qIndex}-${Date.now()}`,
        text: question.Problem || 
              question.problem || 
              question.title || 
              question.name || 
              'Untitled Question',
        completed: question.Done || 
                   question.done || 
                   question.completed || 
                   question.isCompleted || 
                   false,
        difficulty: question.difficulty || 
                    question.Difficulty || 
                    'Medium',
        link: question.URL || 
              question.url || 
              question.link || 
              question.Link || 
              null,
        notes: question.notes || question.Notes || '',
        createdAt: question.createdAt || new Date().toISOString(),
      });
    });

    // Convert Maps to array structure
    const transformedTopics = Array.from(topicsMap.entries()).map(([topicName, topicData], topicIndex) => {
      const subTopicsArray = Array.from(topicData.subTopics.entries()).map(([subTopicName, subTopicData], subIndex) => ({
        id: `sub-${topicIndex}-${subIndex}-${Date.now()}`,
        title: subTopicName,
        questions: subTopicData.questions,
        createdAt: new Date().toISOString(),
      }));

      return {
        id: `topic-${topicIndex}-${Date.now()}`,
        title: topicName,
        subTopics: subTopicsArray,
        createdAt: new Date().toISOString(),
      };
    });

    console.log("✅ Transformed Data:", transformedTopics);
    console.log(`📊 Loaded ${transformedTopics.length} topics with ${questionsArray.length} total questions`);
    
    return transformedTopics;
  }

  // Cache management
  setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache() {
    this.cache.clear();
  }

  // Mock CRUD operations with proper delays
  async createTopic(topicData) {
    await this.simulateDelay();
    return { success: true, data: topicData };
  }

  async updateTopic(topicId, updates) {
    await this.simulateDelay();
    return { success: true, data: { topicId, ...updates } };
  }

  async deleteTopic(topicId) {
    await this.simulateDelay();
    return { success: true, topicId };
  }

  async createSubTopic(topicId, subTopicData) {
    await this.simulateDelay();
    return { success: true, data: { topicId, ...subTopicData } };
  }

  async updateSubTopic(topicId, subTopicId, updates) {
    await this.simulateDelay();
    return { success: true, data: { topicId, subTopicId, ...updates } };
  }

  async deleteSubTopic(topicId, subTopicId) {
    await this.simulateDelay();
    return { success: true, topicId, subTopicId };
  }

  async createQuestion(topicId, subTopicId, questionData) {
    await this.simulateDelay();
    return { success: true, data: { topicId, subTopicId, ...questionData } };
  }

  async updateQuestion(topicId, subTopicId, questionId, updates) {
    await this.simulateDelay();
    return { success: true, data: { topicId, subTopicId, questionId, ...updates } };
  }

  async deleteQuestion(topicId, subTopicId, questionId) {
    await this.simulateDelay();
    return { success: true, topicId, subTopicId, questionId };
  }

  async toggleQuestionComplete(topicId, subTopicId, questionId, completed) {
    await this.simulateDelay(200); // Faster for toggle
    return { success: true, data: { topicId, subTopicId, questionId, completed } };
  }

  simulateDelay(ms = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const sheetAPI = new SheetAPI();

// This wrapper function fetches AND transforms the data in one go
export const fetchAndImportSheet = async (slug) => {
  console.log("🚀 Fetching sheet:", slug);
  
  const result = await sheetAPI.fetchSheetBySlug(slug);
  
  if (result.success) {
    const transformedData = sheetAPI.transformAPIData(result.data);
    console.log("✅ Ready to import:", transformedData.length, "topics");
    return { success: true, data: transformedData, cached: result.cached };
  }
  
  return result;
};