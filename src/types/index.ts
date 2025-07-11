export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  points: number;
  avatarUrl: string;
  checkInStreak?: number;
  lastCheckIn?: string;
  isEmailVerified: boolean;
  referralCode?: string;
  referredBy?: string;
  consecutiveCheckIns: number;
  lastCheckInDate?: string;
  totalSuccessfulReferrals: number;
  createdAt: string;
};

export type Prediction = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  'data-ai-hint'?: string;
  answer: string;
  pointsCost: number;
  status: 'active' | 'finished';
  authorId: string;
  createdAt: string;
  winnerId?: string | {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

export type UserPrediction = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  predictionId: string;
  guess: string;
  isCorrect: boolean;
  pointsSpent: number;
  createdAt: string;
};

export type Feedback = {
  id: string;
  userId: string;
  user: User;
  feedbackText: string;
  status: 'pending' | 'approved' | 'rejected';
  awardedPoints?: number;
  createdAt: string;
};

export type PointTransaction = {
  id: string;
  userId: string;
  user: { name: string };
  adminId?: string;
  admin?: { name: string };
  amount: number;
  reason:
    | 'check-in'
    | 'referral'
    | 'feedback'
    | 'prediction-win'
    | 'admin-grant'
    | 'streak-bonus';
  createdAt: string;
  notes?: string;
};

export type Question = {
  id: string;
  questionText: string;
  imageUrl?: string;
  answer: string;
  isPriority: boolean;
  status: 'active' | 'inactive';
  displayCount: number;
  correctAnswerCount: number;
  points: number;
  createdAt: string;
};

export type Referral = {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUser: { 
    id: string;
    name: string; 
    email: string;
    avatarUrl: string;
    createdAt: string; 
    consecutiveCheckIns: number 
  };
  status: 'pending' | 'completed';
  createdAt: string;
};

export type CheckIn = {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
  checkInDate: string;
  createdAt: string;
};

// Auth related types
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
  points: number;
  avatarUrl: string;
  isEmailVerified: boolean;
  consecutiveCheckIns: number;
  totalSuccessfulReferrals: number;
  referralCode?: string;
  createdAt: string;
  
  // Personal Information
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | '';
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Account Status
  isAutoCreated?: boolean;
  lastLogin?: string;
  totalOrderValue?: number;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
};

// Order related types
export type OrderLineItem = {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: Array<{
    id: number;
    total: string;
    subtotal: string;
  }>;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  sku: string;
  price: number;
  image: {
    id: number;
    src: string;
  };
  parent_name: string;
};

export type OrderAddress = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};

export type Order = {
  id: string;
  wordpressOrderId: number;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed' | 'trash' | 'ecpay-shipping' | 'ecpay';
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  total: string;
  currency: string;
  paymentMethod: string;
  paymentMethodTitle: string;
  transactionId?: string;
  lineItems: OrderLineItem[];
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  orderKey: string;
  dateCreated: string;
  dateModified: string;
  dateCompleted?: string;
  datePaid?: string;
  customerNote?: string;
  metaData: Array<{
    key: string;
    value: any;
  }>;
  isProcessed: boolean;
  processedAt?: string;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderStats = {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  onHoldOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  failedOrders: number;
  ecpayOrders: number;
  ecpayShippingOrders: number;
  trashOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
};

// API Response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// --- Survey Types ---

export interface SurveyOption {
  _id: string;
  text: string;
  antiFraudGroupId?: string;
}

export interface SurveyQuestion {
  _id: string;
  text: string;
  type: 'short-text' | 'long-text' | 'single-choice' | 'multiple-choice';
  isRequired: boolean;
  options: SurveyOption[];
  isAntiFraud: boolean;
}

export interface Survey {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: 'draft' | 'published' | 'closed';
  pointsAwarded: number;
  endDate?: string;
  questions: SurveyQuestion[];
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface SurveyAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  answer: string[];
  otherText?: string;
}

export interface SurveySubmission {
  _id: string;
  surveyId: string;
  userId: string;
  user: { // Populated from backend
    name: string;
    email: string;
  };
  answers: SurveyAnswer[];
  isFraudulent: boolean;
  fraudReason?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- Voting Types ---

export interface VotingCampaign {
  _id: string;
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  pointsPerVote: number;
  maxVotesPerUser: number;
  votingFrequency: 'once' | 'daily';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'upcoming' | 'closed';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional computed fields from API
  entryCount?: number;
  totalVotes?: number;
  isVotingOpen?: boolean;
  isVotingCompleted?: boolean;
  remainingTime?: number;
}

export interface VoteEntry {
    _id: string;
    id: string;
  campaignId: string;
  title: string;
  description: string;
  imageUrl?: string;
  submittedBy: string | {
    id: string;
    name: string;
  };
  voteCount: number;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields from API
  votes?: Array<{
    id: string;
    voteDate: string;
    userName: string; // Masked username
  }>;
}

export interface UserVote {
  id: string;
  userId: string;
  campaignId: string;
  entryId: string;
  voteDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields when fetching voting history
  campaignId_populated?: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  entryId_populated?: {
    title: string;
    description: string;
    voteCount: number;
  };
}

export interface VotingCampaignDetail {
  campaign: VotingCampaign & {
    isVotingOpen: boolean;
    isVotingCompleted: boolean;
    remainingTime: number;
  };
  entries: VoteEntry[];
  userVotes: string[]; // Array of entry IDs that current user has voted for
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

export interface VotingStatistics {
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
  topEntries: VoteEntry[];
  votingActivity: Array<{
    _id: string; // Date string
    count: number;
  }>;
}

// For creating/updating campaigns
export interface CreateVotingCampaignData {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  pointsPerVote: number;
  maxVotesPerUser: number;
  votingFrequency: 'once' | 'daily';
}

// For creating/updating entries
export interface CreateVoteEntryData {
  title: string;
  description: string;
  imageUrl?: string;
} 