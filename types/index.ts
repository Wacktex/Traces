// ================================================================
// TRACES — Core Type Definitions
// ================================================================

export type TraceCategory =
  | 'first_impression'
  | 'one_word'
  | 'midnight_thought'
  | 'something_id_never_say'
  | 'memory'
  | 'assumption'
  | 'compliment'
  | 'song_reminder'
  | 'confession'
  | 'freeform';

export type RevealType = 'ghost' | 'shadow' | 'echo' | 'signal';

export type TraceStatus =
  | 'pending'
  | 'delivered'
  | 'scheduled'
  | 'shadow_banned'
  | 'removed';

export type CapsuleCondition =
  | 'date'
  | 'graduation'
  | 'finals'
  | 'bad_day'
  | 'manual'
  | 'custom';

export type NotificationType =
  | 'trace_received'
  | 'capsule_unlocked'
  | 'reveal_request'
  | 'song_received'
  | 'system';

// ─── Database Row Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  clerk_id: string;
  username: string;
  bio: string | null;
  profile_image: string | null;
  theme: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export type EmotionalTone =
  | 'warm'
  | 'sincere'
  | 'playful'
  | 'gentle'
  | 'bold'
  | 'neutral';

export interface Trace {
  id: string;
  receiver_id: string;
  content: string;
  category: TraceCategory;
  reveal_type: RevealType;
  status: TraceStatus;
  scheduled_time: string | null;
  sender_fingerprint: string | null;
  toxicity_score: number | null;
  song_url: string | null;
  song_note: string | null;
  clue: string | null;
  emotional_tone?: EmotionalTone | null;
  created_at: string;
}

export interface TimeCapsule {
  id: string;
  trace_id: string;
  unlock_date: string | null;
  unlock_condition: CapsuleCondition;
  unlocked_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface RevealRequest {
  id: string;
  trace_id: string;
  receiver_id: string;
  sender_fingerprint: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  responded_at: string | null;
  created_at: string;
}

// ─── API Request / Response Types ─────────────────────────────────────────────

export interface CreateTraceRequest {
  receiverUsername: string;
  content: string;
  category: TraceCategory;
  revealType: RevealType;
  deliveryMode: DeliveryMode;
  customDate?: string;
  milestoneDate?: string;
  emotionalTone?: EmotionalTone;
  songUrl?: string;
  songNote?: string;
  clue?: string;
}

export interface CreateTraceResponse {
  success: boolean;
  traceId?: string;
  error?: string;
  rateLimited?: boolean;
}

export type DeliveryMode =
  | 'now'
  | 'tomorrow'
  | '7days'
  | 'milestone_graduation'
  | 'milestone_finals'
  | 'milestone_birthday'
  | 'comfort'
  | 'custom'
  /** @deprecated use milestone_graduation + milestoneDate */
  | 'graduation'
  /** @deprecated use comfort */
  | 'bad_day';

export interface TraceWithCapsule extends Trace {
  /** Supabase join may return one object (1:1) or an array. */
  time_capsules?: TimeCapsule | TimeCapsule[];
  isViewed?: boolean;
}

export interface SealedCapsuleItem {
  capsule: TimeCapsule;
  trace: TraceWithCapsule;
}

export interface DashboardSummary {
  unopenedCount: number;
  capsuleCount: number;
  hasSongTrace: boolean;
  latestTraces: TraceWithCapsule[];
  sealedCapsules: SealedCapsuleItem[];
}

export interface PublicProfile {
  username: string;
  bio: string | null;
  profile_image: string | null;
  theme: string;
}

export interface ModerationResult {
  approved: boolean;
  toxicityScore: number;
  shadowBan: boolean;
  reason?: string;
}

// ─── Additional table rows ─────────────────────────────────────────────────────

export interface Block {
  id: string;
  blocker_id: string;
  blocked_fingerprint: string;
  created_at: string;
}

export interface RateLimitLog {
  id: string;
  fingerprint: string;
  action: string;
  created_at: string;
}

export interface ShadowBan {
  id: string;
  fingerprint: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  trace_id: string;
  reporter_id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
}

export interface TraceView {
  id: string;
  trace_id: string;
  viewer_id: string;
  created_at: string;
}

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Omit<Row, 'id' | 'created_at'>>;
  Update: Partial<Row>;
};

// ─── Supabase Database type shorthand ─────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: TableDef<User>;
      traces: TableDef<Trace>;
      time_capsules: TableDef<TimeCapsule>;
      notifications: TableDef<Notification>;
      reveal_requests: TableDef<RevealRequest>;
      blocks: TableDef<Block>;
      rate_limit_log: TableDef<RateLimitLog>;
      shadow_bans: TableDef<ShadowBan>;
      reports: TableDef<Report>;
      trace_views: TableDef<TraceView>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
