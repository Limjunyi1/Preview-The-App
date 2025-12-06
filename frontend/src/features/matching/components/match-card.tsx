import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, MapPin, Briefcase, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Match } from "@/features/matching/types/match";

interface MatchCardProps {
  match: Match;
  onRunSimulation: (matchId: string) => void;
  onViewReport: (match: Match) => void;
}

const MatchCard = ({ match, onRunSimulation, onViewReport }: MatchCardProps) => {
  const { id, name, age, occupation, location, avatar, tags, status, compatibilityScore } = match;
  const navigate = useNavigate();

  return (
    <div className={cn(
      "group relative w-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300",
      status === "simulating" && "ring-2 ring-primary/50",
      status === "completed" && "hover:shadow-elevated cursor-pointer"
    )}>
      {/* Simulating Overlay */}
      {status === "simulating" && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-5">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full gradient-primary animate-pulse flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
          </div>
          
          {/* Simulated Conversation */}
          <div className="w-full max-w-xs space-y-3 mb-4">
            <div className="flex items-start gap-2 animate-conversation" style={{ animationDelay: "0s" }}>
              <div className="w-6 h-6 rounded-full bg-primary/20" />
              <div className="flex-1 bg-muted rounded-lg rounded-tl-none p-2">
                <p className="text-xs text-muted-foreground">Discussing travel preferences...</p>
              </div>
            </div>
            <div className="flex items-start gap-2 flex-row-reverse animate-conversation" style={{ animationDelay: "0.5s" }}>
              <div className="w-6 h-6 rounded-full bg-secondary/20" />
              <div className="flex-1 bg-primary/10 rounded-lg rounded-tr-none p-2">
                <p className="text-xs text-muted-foreground">Sharing financial views...</p>
              </div>
            </div>
            <div className="flex items-start gap-2 animate-conversation" style={{ animationDelay: "1s" }}>
              <div className="w-6 h-6 rounded-full bg-primary/20" />
              <div className="flex-1 bg-muted rounded-lg rounded-tl-none p-2">
                <p className="text-xs text-muted-foreground">Exploring future goals...</p>
              </div>
            </div>
          </div>

          <div className="w-full bg-border rounded-full h-1 overflow-hidden">
            <div className="h-full gradient-primary animate-[shimmer_2s_infinite]" style={{ width: "60%" }} />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Simulating your first date...
          </p>
        </div>
      )}

      {/* Card Content */}
      <div 
        className={cn("p-5", status === "completed" && "cursor-pointer")}
        onClick={() => status === "completed" && onViewReport(match)}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            {status === "completed" && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-xs font-bold shadow-soft">
                {compatibilityScore}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground">
              {name}, {age}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="w-3 h-3" />
              <span className="truncate">{occupation}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-secondary/50">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {status === "idle" && (
            <Button
              variant="hero"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onRunSimulation(id);
              }}
            >
              <Play className="w-4 h-4" />
              Run Preview
            </Button>
          )}
          {status === "completed" && (
            <>
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReport(match);
                }}
              >
                <Eye className="w-4 h-4" />
                View Report
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Chat with ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/chat/${id}`);
                }}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
