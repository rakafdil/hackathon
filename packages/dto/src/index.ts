// Common
export * from './common/base-response.js';

// Auth
export * from './auth.schema.js';
export * from './user.schema.js';

// Agro-Risk
export {
  RecommendationRequestSchema,
  RecommendationRequestDto,
  RecommendationDataSchema,
  RecommendationDataDto,
} from './agro-risk/recommendation.dto.js';
export type {
  RecommendationRequest,
  RecommendationData,
} from './agro-risk/recommendation.dto.js';

export {
  DashboardQuerySchema,
  DashboardQueryDto,
  DashboardDataSchema,
  DashboardDataDto,
} from './agro-risk/dashboard.dto.js';
export type {
  DashboardQuery,
  DashboardData,
} from './agro-risk/dashboard.dto.js';

// Market
export {
  PriceQuerySchema,
  PriceQueryDto,
  RegionalPriceItemSchema,
  RegionalPriceItemDto,
} from './market/prices.dto.js';
export type {
  PriceQuery,
  RegionalPriceItem,
} from './market/prices.dto.js';

// AI Chat
export {
  AIChatRequestSchema,
  AIChatRequestDto,
  AIChatDataSchema,
  AIChatDataDto,
} from './ai-chat/chat.dto.js';
export type {
  AIChatRequest,
  AIChatData,
} from './ai-chat/chat.dto.js';

// Farm Profile
export {
  CreateFarmProfileSchema,
  CreateFarmProfileDto,
} from './farm-profile/farm-profile.dto.js';
export type {
  CreateFarmProfile,
} from './farm-profile/farm-profile.dto.js';
