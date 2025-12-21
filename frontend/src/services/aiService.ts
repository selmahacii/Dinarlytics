/**
 * AI Service - Dynamic calls to AI backend
 */

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/ai';

export interface AIResponse {
  content: string;
  confidence: number;
  category: string;
  relatedQuestions: string[];
  sources?: string[];
}

export const aiService = {
  /**
   * Chat with the AI - get intelligent responses
   */
  chat: async (message: string, context?: any): Promise<AIResponse> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });
      if (!res.ok) throw new Error('AI chat failed');
      return res.json();
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  /**
   * Get AI insights for current data
   */
  getInsights: async (dataType: string, data: any): Promise<any> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType, data })
      });
      if (!res.ok) throw new Error('Failed to get insights');
      return res.json();
    } catch (error) {
      console.error('Insights error:', error);
      throw error;
    }
  },

  /**
   * Get AI analysis of financial data
   */
  analyzeFinancials: async (financialData: any): Promise<any> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/analyze/financials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialData)
      });
      if (!res.ok) throw new Error('Failed to analyze financials');
      return res.json();
    } catch (error) {
      console.error('Financial analysis error:', error);
      throw error;
    }
  },

  /**
   * Generate AI predictions
   */
  generatePredictions: async (historyData: any): Promise<any> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      });
      if (!res.ok) throw new Error('Failed to generate predictions');
      return res.json();
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  },

  /**
   * Get contextual suggestions based on current page
   */
  getContextualSuggestions: async (pageContext: string): Promise<string[]> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/suggestions?context=${pageContext}`);
      if (!res.ok) throw new Error('Failed to get suggestions');
      const data = await res.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  },

  /**
   * Get related questions for current context
   */
  getRelatedQuestions: async (question: string): Promise<string[]> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/related-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!res.ok) throw new Error('Failed to get related questions');
      const data = await res.json();
      return data.questions || [];
    } catch (error) {
      console.error('Related questions error:', error);
      return [];
    }
  },

  /**
   * Generate report via AI
   */
  generateReport: async (reportType: string, data: any): Promise<any> => {
    try {
      const res = await fetch(`${AI_API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, data })
      });
      if (!res.ok) throw new Error('Failed to generate report');
      return res.json();
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }
};

export default aiService;
