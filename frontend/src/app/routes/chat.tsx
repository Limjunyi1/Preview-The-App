import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Send, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUIProfile } from "@/features/profiles/api/get-profiles";
import type { UIProfile } from "@/features/profiles/types/ui-profile";
import { getCurrentUser } from "@/lib/storage";
import { useChatMessages, useSaveChatMessage } from "@/features/chat/api/use-messages";

const Chat = () => {
  const { id: matchUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");

  // Get current user from localStorage
  const currentUser = getCurrentUser();

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch messages from localStorage via React Query
  const { data: messages = [] } = useChatMessages(currentUser, matchUserId ?? null);
  const saveChatMessageMutation = useSaveChatMessage();

  // Fetch the profile data
  const { data: profile } = useUIProfile(matchUserId);

  // Fallback profile if loading or error
  const displayProfile: UIProfile = profile ?? {
    id: matchUserId ?? "unknown",
    name: "New Match",
    age: 0,
    occupation: "—",
    location: "—",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop",
    tags: [],
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !currentUser || !matchUserId) return;

    // Save user message to localStorage
    saveChatMessageMutation.mutate({
      currentUserId: currentUser,
      matchUserId: matchUserId,
      message: { sender: "user", text },
    });

    setInput("");

    // Simulate match response (in a real app, this would come from the other user)
    setTimeout(() => {
      saveChatMessageMutation.mutate({
        currentUserId: currentUser,
        matchUserId: matchUserId,
        message: {
          sender: "match",
          text: "Sounds good! I can do Thursday after 7pm. Want to try that new tapas spot downtown?",
        },
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <img
                src={displayProfile.avatar}
                alt={displayProfile.name}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{displayProfile.name}{displayProfile.age ? `, ${displayProfile.age}` : ""}</p>
                  {displayProfile.compatibilityScore ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                      {displayProfile.compatibilityScore}% match
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{displayProfile.occupation} • {displayProfile.location}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Audio call">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Video call">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {displayProfile.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="bg-secondary/50 text-xs">
                {tag}
              </Badge>
            ))}
            <Badge variant="outline" className="gap-1 text-xs">
              <Sparkles className="w-3 h-3 text-primary" />
              AI suggestions on
            </Badge>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-soft min-h-[60vh] flex flex-col overflow-hidden">
            <div className="flex-1 px-4 sm:px-6 py-5 space-y-4 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm shadow-card border",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-border"
                    )}
                  >
                    {message.text}
                    <div className={cn(
                      "mt-2 text-[11px] opacity-70",
                      message.sender === "user" ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="border-t border-border bg-card/80 backdrop-blur px-4 sm:px-6 py-4">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Send a message to ${displayProfile.name}...`}
                  className="flex-1 h-12 rounded-full"
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-full" aria-label="Send message">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Quick prompts:</span>
            <button
              className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition"
              type="button"
              onClick={() => setInput("Want to grab coffee or a walk this weekend?")}
            >
              Coffee or walk this weekend?
            </button>
            <button
              className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition"
              type="button"
              onClick={() => setInput("What’s your favorite neighborhood spot lately?")}
            >
              Favorite neighborhood spot?
            </button>
            <button
              className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition"
              type="button"
              onClick={() => setInput("Thursday 7pm works — tapas downtown?")}
            >
              Confirm Thursday 7pm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

