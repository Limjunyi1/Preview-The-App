import type { ChatProfile } from "@/features/chat/types/profile";

export const mockProfiles: ChatProfile[] = [
  {
    id: "1",
    name: "Jordan",
    age: 28,
    occupation: "Product Designer",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=320&fit=crop",
    tags: ["Family-oriented", "Creative", "Adventurous"],
    compatibilityScore: 80
  },
  {
    id: "2",
    name: "Alex",
    age: 31,
    occupation: "Software Engineer",
    location: "New York, NY",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop",
    tags: ["Career-driven", "Analytical", "Fitness enthusiast"],
    compatibilityScore: 84
  },
  {
    id: "3",
    name: "Sam",
    age: 29,
    occupation: "Marketing Manager",
    location: "Los Angeles, CA",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=320&h=320&fit=crop",
    tags: ["Social butterfly", "Travel lover", "Foodie"]
  }
];

