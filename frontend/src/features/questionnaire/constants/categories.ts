import { Wallet, Home, MessageSquare, Shield } from "lucide-react";

export const categories = [
  {
    id: "financial",
    title: "Financial Philosophy",
    icon: Wallet,
    description: "Understanding your approach to money and finances",
    questions: [
      {
        question: "How would you describe your spending habits?",
        options: ["Careful saver", "Balanced spender", "Experience-focused", "Spontaneous"]
      },
      {
        question: "What's your view on financial risk?",
        options: ["Very conservative", "Moderately cautious", "Balanced approach", "Risk-tolerant"]
      },
      {
        question: "How do you feel about shared finances in relationships?",
        options: ["Keep separate", "Partial sharing", "Full transparency", "Flexible approach"]
      }
    ]
  },
  {
    id: "lifestyle",
    title: "Future Lifestyle",
    icon: Home,
    description: "Your vision for life ahead",
    questions: [
      {
        question: "What are your thoughts on marriage?",
        options: ["Definitely want it", "Open to it", "Prefer partnership", "Not interested"]
      },
      {
        question: "How do you feel about having children?",
        options: ["Definitely want kids", "Open to the idea", "Prefer not to", "Already have kids"]
      },
      {
        question: "How important is geographical stability to you?",
        options: ["Very important", "Prefer stability", "Open to moving", "Love to travel/relocate"]
      }
    ]
  },
  {
    id: "conflict",
    title: "Conflict Style",
    icon: MessageSquare,
    description: "How you navigate disagreements",
    questions: [
      {
        question: "When conflict arises, you typically:",
        options: ["Address it immediately", "Take time to process", "Seek compromise first", "Avoid confrontation"]
      },
      {
        question: "Your preferred communication style is:",
        options: ["Direct and clear", "Thoughtful and measured", "Warm and diplomatic", "Written over verbal"]
      },
      {
        question: "In stressful situations, you tend to:",
        options: ["Need space alone", "Want to talk it out", "Seek physical activity", "Focus on problem-solving"]
      }
    ]
  },
  {
    id: "values",
    title: "Core Values & Boundaries",
    icon: Shield,
    description: "What matters most to you",
    questions: [
      {
        question: "What's most important in a partner?",
        options: ["Emotional intelligence", "Ambition & drive", "Kindness & empathy", "Shared interests"]
      },
      {
        question: "How important is alone time to you?",
        options: ["Essential daily", "Need regularly", "Occasionally nice", "Prefer togetherness"]
      },
      {
        question: "Your approach to personal growth:",
        options: ["Constant learning", "Steady improvement", "Content as I am", "Growth through experience"]
      }
    ]
  }
];

