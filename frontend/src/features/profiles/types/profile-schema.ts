import { z } from "zod";

// Full profile schema matching /json/*.json structure
export const ProfileInfoSchema = z.object({
  display_name: z.string(),
  age: z.number(),
  gender: z.string(),
  pronouns: z.string().nullable().optional(),
  location: z.string(),
  height: z.string().nullable().optional(),
  employment_status: z.string().nullable().optional(),
  employment_title: z.string().nullable().optional(),
  employment_industry: z.string().nullable().optional(),
  orientation: z.string(),
});

export const RelationshipSchema = z.object({
  intent: z.string().nullable().optional(),
  pace_to_meet: z.string().nullable().optional(),
});

export const LifestyleSchema = z.object({
  social_energy: z.string().nullable().optional(),
  weekend_default: z.string().nullable().optional(),
  travel_style: z.string().nullable().optional(),
  work_life_balance: z.string().nullable().optional(),
  pets: z.string().nullable().optional(),
});

export const ValuesSchema = z.object({
  family_closeness: z.string().nullable().optional(),
  money_mindset: z.string().nullable().optional(),
  openness_to_kids: z.string().nullable().optional(),
  faith_importance: z.string().nullable().optional(),
  political_engagement: z.string().nullable().optional(),
  other_values: z.array(z.string()).optional(),
});

export const CommunicationSchema = z.object({
  conflict_style: z.string().nullable().optional(),
  texting_cadence: z.string().nullable().optional(),
  love_languages: z.array(z.string()).optional(),
});

export const EmpathyAccountabilitySchema = z.object({
  past_relationship_reflection: z.string().nullable().optional(),
  accountability_style: z.string().nullable().optional(),
  red_flags_detected: z.array(z.string()).optional(),
});

export const AgentPersonaSchema = z.object({
  tone: z.string().nullable().optional(),
  vocabulary_style: z.string().nullable().optional(),
  humor_style: z.string().nullable().optional(),
  emoji_punctuation: z.string().nullable().optional(),
  directness: z.string().nullable().optional(),
  energy_level: z.string().nullable().optional(),
  emotional_expressiveness: z.string().nullable().optional(),
  quirks_and_phrases: z.array(z.string()).optional(),
  example_messages: z.array(z.string()).optional(),
  system_prompt_snippet: z.string().nullable().optional(),
});

export const FullProfileSchema = z.object({
  profile: ProfileInfoSchema,
  profile_path: z.string().optional(),
  relationship: RelationshipSchema,
  lifestyle: LifestyleSchema,
  values: ValuesSchema,
  communication: CommunicationSchema,
  empathy_accountability: EmpathyAccountabilitySchema,
  dealbreakers: z.array(z.string()),
  must_haves: z.array(z.string()),
  agent_persona: AgentPersonaSchema,
  additional_notes: z.string().nullable().optional(),
  AI_summary: z.string().optional(),
  confidence_score: z.string().optional(),
});

export type FullProfile = z.infer<typeof FullProfileSchema>;
export type ProfileInfo = z.infer<typeof ProfileInfoSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type Lifestyle = z.infer<typeof LifestyleSchema>;
export type Values = z.infer<typeof ValuesSchema>;
export type Communication = z.infer<typeof CommunicationSchema>;
export type EmpathyAccountability = z.infer<typeof EmpathyAccountabilitySchema>;
export type AgentPersona = z.infer<typeof AgentPersonaSchema>;

