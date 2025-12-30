import axios from 'axios';
import type { ApiResponse, LoginCredentials, RegisterData, Prediction, UserPrediction, User, Question, Feedback, Contest, UserContest } from '../types';
import { getGuestId } from '../utils/guestCart';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://predict-backend-63un.onrender.com/api';
  
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Public API instance without auth interceptor
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for public API to add guest ID
publicApi.interceptors.request.use((config) => {
  const guestId = getGuestId();
  if (guestId) {
    config.headers['X-Guest-Id'] = guestId;
  }
  return config;
});

// Request interceptor to add auth token and guest ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Remove guest ID header if user is logged in
    if (config.headers['X-Guest-Id']) {
      delete config.headers['X-Guest-Id'];
    }
  } else {
    // For guest users, add guest ID
    const guestId = getGuestId();
    if (guestId) {
      config.headers['X-Guest-Id'] = guestId;
    }
  }
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
    }
    return Promise.reject(error);
  }
);

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Public request timeout:', error);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  }): Promise<ApiResponse<User>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await api.put('/users/profile/password', data);
    return response.data;
  },

  getTransactions: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users/transactions');
    return response.data;
  },

  getReferrals: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users/referrals');
    return response.data;
  },
};

// Predictions API with retry logic
export const predictionsAPI = {
  getAll: async (retries = 2): Promise<ApiResponse<Prediction[]>> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await api.get('/predictions');
        return response.data;
      } catch (error) {
        if (i === retries) throw error;
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Failed after retries');
  },

  getById: async (id: string, retries = 2): Promise<ApiResponse<{ prediction: Prediction; userPredictions: UserPrediction[] }>> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await api.get(`/predictions/${id}`);
        return response.data;
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Failed after retries');
  },

  submit: async (id: string, guess: string, retries = 1): Promise<ApiResponse<{ isCorrect: boolean; bonusPoints?: number }>> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await api.post(`/predictions/${id}/submit`, { guess });
        return response.data;
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Failed after retries');
  },
};

// Admin API
export const adminAPI = {
  createPrediction: async (data: {
    title: string;
    description: string;
    imageUrl: string;
    answer: string;
    pointsCost: number;
  }): Promise<ApiResponse<Prediction>> => {
    const response = await api.post('/admin/predictions', data);
    return response.data;
  },

  getAllPredictions: async (): Promise<ApiResponse<Prediction[]>> => {
    const response = await api.get('/admin/predictions');
    return response.data;
  },

  updatePrediction: async (id: string, data: any): Promise<ApiResponse<Prediction>> => {
    const response = await api.put(`/admin/predictions/${id}`, data);
    return response.data;
  },

  deletePrediction: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/predictions/${id}`);
    return response.data;
  },

  updatePredictionStatus: async (id: string, status: string): Promise<ApiResponse<Prediction>> => {
    const response = await api.put(`/admin/predictions/${id}/status`, { status });
    return response.data;
  },

  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  grantPoints: async (data: {
    userId: string;
    amount: number;
    notes?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/admin/grant-points', data);
    return response.data;
  },

  // Feedback management
  getAllFeedback: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/feedback');
    return response.data;
  },

  approveFeedback: async (feedbackId: string, awardedPoints: number): Promise<ApiResponse> => {
    const response = await api.patch(`/admin/feedback/${feedbackId}/approve`, { points: awardedPoints });
    return response.data;
  },

  rejectFeedback: async (feedbackId: string): Promise<ApiResponse> => {
    const response = await api.patch(`/admin/feedback/${feedbackId}/reject`);
    return response.data;
  },

  // Questions management
  getAllQuestions: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/questions');
    return response.data;
  },

  createQuestion: async (data: {
    questionText: string;
    imageUrl?: string;
    answer: string;
    isPriority: boolean;
    points: number;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/questions', data);
    return response.data;
  },

  updateQuestion: async (questionId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/questions/${questionId}`, data);
    return response.data;
  },

  // Transactions
  getTransactions: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/transactions');
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  // Staff Management
  getAllStaff: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/staff');
    return response.data;
  },

  createStaff: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/staff', data);
    return response.data;
  },

  updateStaff: async (staffId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/staff/${staffId}`, data);
    return response.data;
  },

  deleteStaff: async (staffId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/staff/${staffId}`);
    return response.data;
  },
};

// Check-in API
export const checkInAPI = {
  getStatus: async (): Promise<ApiResponse<{ hasCheckedIn: boolean; isCorrect?: boolean; pointsEarned?: number }>> => {
    const response = await api.get('/check-in/status');
    return response.data;
  },

  getQuestion: async (isPublic = false): Promise<ApiResponse<Question>> => {
    const url = isPublic ? '/check-in/question/public' : '/check-in/question';
    const response = await (isPublic ? publicApi.get(url) : api.get(url));
    return response.data;
  },

  submit: async (data: {
    questionId: string;
    answer: string;
  }): Promise<ApiResponse<{ isCorrect: boolean; pointsEarned: number; correctAnswer: string }>> => {
    const response = await api.post('/check-in/submit', data);
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submit: async (feedbackText: string): Promise<ApiResponse<Feedback>> => {
    const response = await api.post('/feedback', { feedbackText });
    return response.data;
  },

  getMy: async (): Promise<ApiResponse<Feedback[]>> => {
    const response = await api.get('/feedback/my');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<{
    totalUsers: number;
    totalPredictions: number;
    activePredictions: number;
    totalPoints: number;
    recentPredictions: Prediction[];
  }>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// Staff API
export const staffAPI = {
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/staff/dashboard-stats');
    return response.data;
  },

  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    verified?: boolean;
  } = {}): Promise<ApiResponse<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/staff/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId: string, data: { isEmailVerified: boolean }): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/staff/users/${userId}/status`, data);
    return response.data;
  },

  getPredictions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    predictions: Prediction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/staff/predictions', { params });
    return response.data;
  },

  getQuestions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    questions: Question[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/staff/questions', { params });
    return response.data;
  },

  createQuestion: async (data: {
    questionText: string;
    imageUrl?: string;
    answer: string;
    isPriority: boolean;
    points: number;
  }): Promise<ApiResponse<Question>> => {
    const response = await api.post('/staff/questions', data);
    return response.data;
  },

  updateQuestion: async (questionId: string, data: any): Promise<ApiResponse<Question>> => {
    const response = await api.put(`/staff/questions/${questionId}`, data);
    return response.data;
  },

  updateQuestionStatus: async (questionId: string, data: { status: string }): Promise<ApiResponse<Question>> => {
    const response = await api.patch(`/staff/questions/${questionId}/status`, data);
    return response.data;
  },

  updateQuestionPriority: async (questionId: string, data: { isPriority: boolean }): Promise<ApiResponse<Question>> => {
    const response = await api.patch(`/staff/questions/${questionId}/priority`, data);
    return response.data;
  },
};

// Voting API
export const votingAPI = {
  // Public endpoints (no auth required)
  getCampaigns: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await publicApi.get('/voting/campaigns', { params });
    return response.data;
  },

  getCampaignDetail: async (
    id: string,
    params: {
      sortBy?: 'random' | 'votes' | 'newest' | 'oldest';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<any>> => {
    const response = await api.get(`/voting/campaigns/${id}`, { params });
    return response.data;
  },

  // User endpoints (auth required)
  voteForEntry: async (campaignId: string, entryId: string): Promise<ApiResponse<{ pointsEarned: number }>> => {
    const response = await api.post(`/voting/campaigns/${campaignId}/entries/${entryId}/vote`);
    return response.data;
  },

  removeVote: async (campaignId: string, entryId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/voting/campaigns/${campaignId}/entries/${entryId}/vote`);
    return response.data;
  },

  getUserVotingHistory: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/voting/my-votes', { params });
    return response.data;
  },

  // Admin endpoints
  admin: {
    getCampaigns: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {}): Promise<ApiResponse<{
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>> => {
      const response = await api.get('/voting/admin/campaigns', { params });
      return response.data;
    },

    getCampaign: async (id: string): Promise<ApiResponse<{
      campaign: any;
      entries: any[];
      statistics: {
        totalEntries: number;
        totalVotes: number;
        uniqueVoters: number;
      };
    }>> => {
      const response = await api.get(`/voting/admin/campaigns/${id}`);
      return response.data;
    },

    createCampaign: async (data: {
      title: string;
      description: string;
      imageUrl?: string;
      startDate: string;
      endDate: string;
      pointsPerVote: number;
      maxVotesPerUser: number;
      votingFrequency: 'once' | 'daily';
      // status không còn bắt buộc
    }): Promise<ApiResponse<any>> => {
      const response = await api.post('/voting/admin/campaigns', data);
      return response.data;
    },

    updateCampaign: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/voting/admin/campaigns/${id}`, data);
      return response.data;
    },

    deleteCampaign: async (id: string): Promise<ApiResponse> => {
      const response = await api.delete(`/voting/admin/campaigns/${id}`);
      return response.data;
    },

    addEntry: async (campaignId: string, data: {
      title: string;
      description: string;
      imageUrl?: string;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post(`/voting/admin/campaigns/${campaignId}/entries`, data);
      return response.data;
    },

    updateEntry: async (entryId: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/voting/admin/entries/${entryId}`, data);
      return response.data;
    },

    deleteEntry: async (entryId: string): Promise<ApiResponse> => {
      const response = await api.delete(`/voting/admin/entries/${entryId}`);
      return response.data;
    },

    getStatistics: async (campaignId: string): Promise<ApiResponse<{
      campaign: {
        title: string;
        status: string;
        startDate: string;
        endDate: string;
      };
      summary: {
        totalVotes: number;
        uniqueVoters: number;
        totalEntries: number;
      };
      topEntries: any[];
      votingActivity: Array<{
        _id: string;
        count: number;
      }>;
    }>> => {
      const response = await api.get(`/voting/admin/campaigns/${campaignId}/statistics`);
      return response.data;
    },
  },
};

// Contest API
export const contestAPI = {
  getActiveContests: async (): Promise<ApiResponse<Contest[]>> => {
    const response = await api.get('/contests');
    return response.data;
  },

  getContestDetails: async (id: string, page = 1, limit = 20): Promise<ApiResponse<{
    contest: Contest;
    userSubmission: UserContest | null;
    submissions: UserContest[];
    totalSubmissions: number;
    totalPages: number;
  }>> => {
    const response = await api.get(`/contests/${id}?page=${page}&limit=${limit}`);
    return response.data;
  },

  submitAnswer: async (contestId: string, answer: string): Promise<ApiResponse<{
    submission: UserContest;
    remainingPoints: number;
  }>> => {
    const response = await api.post(`/contests/${contestId}/submit`, { answer });
    return response.data;
  },

  getHistory: async (page = 1, limit = 20): Promise<ApiResponse<{
    submissions: UserContest[];
    totalSubmissions: number;
    totalPages: number;
    currentPage: number;
  }>> => {
    const response = await api.get(`/contests/history?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Admin Contest API
export const adminContestAPI = {
  getContests: async (): Promise<ApiResponse<Contest[]>> => {
    const response = await api.get('/admin/contests');
    return response.data;
  },

  getContestById: async (id: string, page = 1, limit = 10): Promise<ApiResponse<Contest>> => {
    const response = await api.get(`/admin/contests/${id}`, { params: { page, limit } });
    return response.data;
  },

  createContest: async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    pointsPerAnswer: number;
    rewardPoints: number;
    imageUrl?: string;
    status?: 'active' | 'finished' | 'draft';
  }): Promise<ApiResponse<Contest>> => {
    const response = await api.post('/admin/contests', data);
    return response.data;
  },

  updateContest: async (id: string, data: any): Promise<ApiResponse<Contest>> => {
    const response = await api.put(`/admin/contests/${id}`, data);
    return response.data;
  },

  deleteContest: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/contests/${id}`);
    return response.data;
  },

  publishAnswer: async (contestId: string, answer: string): Promise<ApiResponse<{
    contest: Contest;
    correctSubmissions: number;
    totalSubmissions: number;
  }>> => {
    const response = await api.put(`/admin/contests/${contestId}/publish-answer`, { answer });
    return response.data;
  },

  getSubmissions: async (contestId: string, page = 1, limit = 20, filter?: string): Promise<ApiResponse<{
    submissions: UserContest[];
    totalSubmissions: number;
    totalPages: number;
    currentPage: number;
    statistics: {
      total: number;
      correct: number;
      incorrect: number;
    };
  }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filter) params.append('filter', filter);
    
    const response = await api.get(`/admin/contests/${contestId}/submissions?${params}`);
    return response.data;
  },

  getStatistics: async (contestId: string): Promise<ApiResponse<{
    contest: Contest;
    statistics: {
      totalSubmissions: number;
      correctSubmissions: number;
      incorrectSubmissions: number;
      participantCount: number;
      totalPointsSpent: number;
      totalRewardPointsAwarded: number;
      accuracyRate: string;
    };
  }>> => {
    const response = await api.get(`/admin/contests/${contestId}/statistics`);
    return response.data;
  },
};

// Unified API Service
export const apiService = {
  get: api.get.bind(api),
  post: api.post.bind(api),
  put: api.put.bind(api),
  patch: api.patch.bind(api),
  delete: api.delete.bind(api),
  
  // API modules
  auth: authAPI,
  user: userAPI,
  predictions: predictionsAPI,
  admin: adminAPI,
  checkIn: checkInAPI,
  feedback: feedbackAPI,
  dashboard: dashboardAPI,
  staff: staffAPI,
  voting: votingAPI,
  contest: contestAPI,
  adminContest: adminContestAPI,
};

// Public API service for guest users (no interceptors)
export const publicApiService = publicApi;

// Export main API service
export default api; 