import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Send, Sparkles, Brain, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, setCurrentUser } from "@/lib/storage";
import {
  useOnboardingStart,
  useOnboardingReply,
} from "@/features/onboarding/api/use-onboarding";
import { useUpdateProfile } from "@/features/profiles/api/use-current-user-profile";
import type { FullProfile } from "@/features/profiles/types/profile-schema";
import ProfileEditor from "@/features/onboarding/components/profile-editor";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  options?: string[];
}

interface ChatInterfaceProps {
  categories: Array<{
    id: string;
    title: string;
    icon: any;
    description: string;
    questions: Array<{
      question: string;
      options: string[];
    }>;
  }>;
}

type ChatStatus = "chat" | "processing" | "summary";

// Extracted and memoized components to prevent re-renders

const TypingIndicator = memo(() => (
  <div className="flex items-center animate-fade-in">
    <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-card relative overflow-hidden">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
    </div>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

interface MessageBubbleProps {
  message: Message;
  onOptionSelect: (option: string) => void;
}

const MessageBubble = memo(({ message, onOptionSelect }: MessageBubbleProps) => (
  <div className={cn(
    "flex animate-fade-in-up",
    message.sender === 'user' ? "justify-end" : "justify-start"
  )}>
    <div className={cn(
      "max-w-xs lg:max-w-md",
      message.sender === 'user' ? "text-right" : "text-left"
    )}>
      <div className={cn(
        "rounded-2xl px-4 py-3 shadow-card border transition-all duration-200 hover:shadow-elevated",
        message.sender === 'user'
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-card-foreground border-border hover:border-primary/20"
      )}>
        <p className="text-sm font-medium leading-relaxed">{message.content}</p>
      </div>
      
      {message.options && (
        <div className="mt-3 space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {message.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onOptionSelect(option)}
              className="w-full text-left justify-start h-auto p-3 text-sm font-medium border-2 hover:border-primary hover:shadow-soft transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/20" />
                {option}
              </span>
            </Button>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2 opacity-70">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
));
MessageBubble.displayName = "MessageBubble";

interface ProcessingPanelProps {
  progress: number;
}

const ProcessingPanel = memo(({ progress }: ProcessingPanelProps) => (
  <div className="animate-fade-in-up">
    <Card className="border-primary/20 shadow-soft bg-card/80 backdrop-blur">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-soft">
          <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
        </div>
        <div>
          <CardTitle className="text-lg">Generating your AI persona</CardTitle>
          <p className="text-sm text-muted-foreground">Analyzing answers, defining traits, and preparing your report.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-primary/30 text-primary">Persona</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">Goals</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">Compatibility</Badge>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Mapping your preferences to key traits</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>Synthesizing lifestyle, values, and conflict styles</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Building a concise report with goals and tips</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
));
ProcessingPanel.displayName = "ProcessingPanel";


interface ChatHeaderProps {
  answeredQuestions: number;
  totalQuestions: number;
}

const ChatHeader = memo(({ answeredQuestions, totalQuestions }: ChatHeaderProps) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-serif text-xl font-semibold text-foreground">ValueSpark</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {answeredQuestions} of {totalQuestions} completed
        </span>
      </div>
    </div>
  </header>
));
ChatHeader.displayName = "ChatHeader";

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

const ChatInput = memo(({ inputValue, onInputChange, onSend }: ChatInputProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border">
    <div className="container mx-auto max-w-4xl px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type a message or choose from the options above..."
            className="pr-12 h-12 rounded-full border-2 focus:border-primary transition-all duration-200 focus:shadow-soft"
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
          />
          <Button
            size="sm"
            onClick={onSend}
            disabled={!inputValue.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 transition-all duration-200",
              inputValue.trim() 
                ? "gradient-primary text-primary-foreground shadow-soft hover:scale-110" 
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-muted-foreground">
          Choose from the options above for the best experience ✨
        </p>
      </div>
    </div>
  </div>
));
ChatInput.displayName = "ChatInput";

const ChatInterface = ({ categories }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ChatStatus>("chat");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fullProfile, setFullProfile] = useState<FullProfile | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Backend integration state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [useBackend, setUseBackend] = useState(true);
  const [userId] = useState(() => getCurrentUser() ?? `user-${Date.now()}`);

  // API hooks
  const onboardingStartMutation = useOnboardingStart();
  const onboardingReplyMutation = useOnboardingReply();
  const updateProfileMutation = useUpdateProfile();

  const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progressPercent = useBackend && sessionId 
    ? Math.min(90, messages.filter(m => m.sender === 'user').length * 15) 
    : (answeredQuestions / totalQuestions) * 100;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start onboarding session with backend
  useEffect(() => {
    if (useBackend && !sessionId && !onboardingStartMutation.isPending) {
      // Ensure user ID is set
      setCurrentUser(userId);
      
      onboardingStartMutation.mutate(
        { userId },
        {
          onSuccess: (data) => {
            setSessionId(data.session_id);
            setMessages([
              {
                id: `ai-${Date.now()}`,
                content: data.opening_text,
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
          },
          onError: () => {
            // Fall back to frontend-only mode
            setUseBackend(false);
            initializeFrontendMode();
          },
        }
      );
    }
  }, [useBackend, sessionId, userId, onboardingStartMutation]);

  // Initialize frontend-only mode with welcome messages
  const initializeFrontendMode = () => {
    const welcomeMessages: Message[] = [
      {
        id: "welcome-1",
        content: "Hi there! 👋 I'm your AI matchmaking assistant.",
        sender: 'ai',
        timestamp: new Date(),
      },
      {
        id: "welcome-2", 
        content: "I'm here to help you discover your perfect match by understanding what truly matters to you. This will only take a few minutes!",
        sender: 'ai',
        timestamp: new Date(),
      },
      {
        id: "welcome-3",
        content: "Let's start with understanding your financial philosophy. Ready to begin? ✨",
        sender: 'ai',
        timestamp: new Date(),
      }
    ];
    
    // Add welcome messages with delays
    welcomeMessages.forEach((message, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, message]);
        if (index === welcomeMessages.length - 1) {
          // Start with first question after last welcome message
          setTimeout(() => {
            askQuestion();
          }, 1500);
        }
      }, index * 1500);
    });
  };

  const buildFallbackProfile = useCallback((): FullProfile => {
    const pick = (catId: string, questionIndex: number) =>
      answers[`${catId}-${questionIndex}`] ?? "";

    // Build a minimal FullProfile from frontend-only answers
    return {
      profile: {
        display_name: "New User",
        age: 25,
        gender: "Not specified",
        location: "Not specified",
        orientation: "Looking for meaningful connections",
      },
      relationship: {
        intent: "Finding a compatible partner",
      },
      lifestyle: {
        social_energy: pick("lifestyle", 0) || null,
        weekend_default: null,
        travel_style: pick("lifestyle", 2) || null,
        work_life_balance: null,
        pets: null,
      },
      values: {
        family_closeness: null,
        money_mindset: pick("financial", 0) || null,
        openness_to_kids: pick("lifestyle", 1) || null,
        faith_importance: null,
        political_engagement: null,
        other_values: [pick("values", 0), pick("values", 2)].filter(Boolean),
      },
      communication: {
        conflict_style: pick("conflict", 0) || null,
        texting_cadence: pick("conflict", 1) || null,
        love_languages: [],
      },
      empathy_accountability: {
        past_relationship_reflection: null,
        accountability_style: null,
        red_flags_detected: [],
      },
      dealbreakers: [],
      must_haves: [],
      agent_persona: {},
      AI_summary: "Profile created from onboarding questionnaire",
    };
  }, [answers]);

  const startProcessing = useCallback(() => {
    if (status === "processing" || status === "summary") return;

    setStatus("processing");
    setIsTyping(false);
    setProcessingProgress(0);

    const processingMessage: Message = {
      id: `processing-${Date.now()}`,
      content: "Great work! I'm processing your responses to craft an AI persona and a concise report.",
      sender: "ai",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, processingMessage]);

    const steps = [
      { delay: 700, progress: 35, text: "Mapping your preferences to core traits..." },
      { delay: 1400, progress: 70, text: "Synthesizing goals and compatibility signals..." },
      { delay: 2100, progress: 100, text: "Generating your AI persona and personalized report..." }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProcessingProgress(step.progress);
        if (index === steps.length - 1) {
          setTimeout(() => {
            const fallbackProfile = buildFallbackProfile();
            setFullProfile(fallbackProfile);
            setStatus("summary");
            setMessages(prev => [
              ...prev,
              {
                id: `persona-ready-${Date.now()}`,
                content: "Your AI persona is ready. Here's your personalized personality and goals report.",
                sender: "ai",
                timestamp: new Date()
              }
            ]);
          }, 600);
        }
      }, step.delay);
    });
  }, [status, buildFallbackProfile]);

  // Use ref to hold askQuestion to avoid circular dependency in useCallback
  const askQuestionRef = useRef<(categoryIndex?: number, questionIndex?: number) => void>(() => {});
  
  const askQuestion = useCallback((categoryIndex = currentCategoryIndex, questionIndex = currentQuestionIndex) => {
    if (categoryIndex >= categories.length) {
      startProcessing();
      return;
    }

    const category = categories[categoryIndex];
    const question = category.questions[questionIndex];
    
    // Add category transition message for first question of new category
    if (questionIndex === 0 && categoryIndex > 0) {
      const transitionMessage: Message = {
        id: `transition-${categoryIndex}`,
        content: `Great! Now let's explore your ${category.title.toLowerCase()}. ${category.description}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, transitionMessage]);
        
        // Ask the actual question after transition
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const questionMessage: Message = {
              id: `question-${categoryIndex}-${questionIndex}`,
              content: question.question,
              sender: 'ai',
              timestamp: new Date(),
              options: question.options,
            };
            
            setIsTyping(false);
            setMessages(prev => [...prev, questionMessage]);
          }, 800);
        }, 1000);
      }, 600);
    } else {
      // Regular question
      setIsTyping(true);
      setTimeout(() => {
        const questionMessage: Message = {
          id: `question-${categoryIndex}-${questionIndex}`,
          content: question.question,
          sender: 'ai',
          timestamp: new Date(),
          options: question.options,
        };
        
        setIsTyping(false);
        setMessages(prev => [...prev, questionMessage]);
      }, 800);
    }
  }, [categories, currentCategoryIndex, currentQuestionIndex, startProcessing]);
  
  // Keep ref updated
  askQuestionRef.current = askQuestion;

  const handleOptionSelect = useCallback((option: string) => {
    if (status !== "chat") return;

    // Add user's response
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: option,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    // If using backend, send the option as a message
    if (useBackend && sessionId) {
      setIsTyping(true);
      onboardingReplyMutation.mutate(
        { sessionId, message: option },
        {
          onSuccess: (data) => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                content: data.reply,
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
            
            // Check if onboarding is complete
            if (data.done && data.persona_json) {
              setStatus("summary");
              setFullProfile(data.persona_json as FullProfile);
            }
          },
          onError: () => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                content: "Sorry, I had trouble processing that. Could you try again?",
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
          },
        }
      );
      return;
    }

    // Frontend-only mode: use category-based questions
    const questionKey = `${categories[currentCategoryIndex].id}-${currentQuestionIndex}`;
    setAnswers(prev => ({ ...prev, [questionKey]: option }));
    
    // Move to next question
    const isLastQuestionInCategory = currentQuestionIndex >= categories[currentCategoryIndex].questions.length - 1;
    const isLastCategory = currentCategoryIndex >= categories.length - 1;

    let nextCategoryIndex = currentCategoryIndex;
    let nextQuestionIndex = currentQuestionIndex;

    if (!isLastQuestionInCategory) {
      nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
    } else if (!isLastCategory) {
      nextCategoryIndex = currentCategoryIndex + 1;
      nextQuestionIndex = 0;
      setCurrentCategoryIndex(nextCategoryIndex);
      setCurrentQuestionIndex(0);
    } else {
      // Completed all questions
      nextCategoryIndex = categories.length;
      nextQuestionIndex = 0;
      setCurrentCategoryIndex(nextCategoryIndex);
    }
    
    // Ask next question or start processing after a short delay
    // Use ref to always get latest askQuestion without causing re-renders
    setTimeout(() => {
      askQuestionRef.current(nextCategoryIndex, nextQuestionIndex);
    }, 900);
  }, [status, useBackend, sessionId, onboardingReplyMutation, categories, currentCategoryIndex, currentQuestionIndex]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    
    // Use backend if we have a session
    if (useBackend && sessionId) {
      setIsTyping(true);
      onboardingReplyMutation.mutate(
        { sessionId, message: messageText },
        {
          onSuccess: (data) => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                content: data.reply,
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
            
            // Check if onboarding is complete
            if (data.done && data.persona_json) {
              setStatus("summary");
              setFullProfile(data.persona_json as FullProfile);
            }
          },
          onError: () => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                content: "Sorry, I had trouble processing that. Could you try again?",
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
          },
        }
      );
    } else {
      // Frontend-only fallback
      setIsTyping(true);
      setTimeout(() => {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: "I appreciate your message! However, I'd like to focus on the questionnaire to better understand your preferences. Let's continue with the questions.",
          sender: 'ai',
          timestamp: new Date(),
        };
        setIsTyping(false);
        setMessages(prev => [...prev, aiMessage]);
      }, 1500);
    }
  }, [inputValue, useBackend, sessionId, onboardingReplyMutation]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleProfileSave = useCallback((updatedProfile: FullProfile) => {
    updateProfileMutation.mutate(
      { userId, profile: updatedProfile },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
        onError: (error) => {
          console.error("Failed to save profile:", error);
          // Still navigate on error - profile was already saved during onboarding
          navigate("/dashboard");
        },
      }
    );
  }, [userId, updateProfileMutation, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Header - memoized */}
      <ChatHeader answeredQuestions={answeredQuestions} totalQuestions={totalQuestions} />

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <Progress value={progressPercent} className="h-1 rounded-none" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 pt-20 pb-20">
        <div className="container mx-auto max-w-4xl px-6 h-full">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-6 py-6">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  onOptionSelect={handleOptionSelect}
                />
              ))}
              {isTyping && <TypingIndicator />}
              {status === "processing" && <ProcessingPanel progress={processingProgress} />}
              {status === "summary" && fullProfile && (
                <ProfileEditor 
                  profile={fullProfile} 
                  onSave={handleProfileSave}
                  isSaving={updateProfileMutation.isPending}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Input Area - memoized */}
      <ChatInput 
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default ChatInterface;
