export interface ChatProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  avatar: string;
  tags: string[];
  compatibilityScore?: number;
}

