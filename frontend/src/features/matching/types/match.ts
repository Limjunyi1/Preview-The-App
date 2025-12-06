export type MatchStatus = "idle" | "simulating" | "completed";

export interface Match {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  avatar: string;
  tags: string[];
  status: MatchStatus;
  compatibilityScore?: number;
}

