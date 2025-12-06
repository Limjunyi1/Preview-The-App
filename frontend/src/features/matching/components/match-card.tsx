import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, MapPin, Briefcase, Sparkles, MessageSquare, CheckCircle } from "lucide-react";
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
    <div 
      className={cn(
        "group relative w-full h-full rounded-3xl bg-card overflow-hidden transition-all duration-300 flex flex-col",
        "border border-border/50 shadow-sm hover:shadow-elevated hover:-translate-y-1",
        status === "simulating" && "ring-2 ring-primary/50",
      )}
      onClick={() => status === "completed" && onViewReport(match)}
    >
      {/* Simulating Overlay */}
      {status === "simulating" && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-5">
          <div className="relative mb-4">
            <div className="w-12 h-12 rounded-full gradient-primary animate-pulse flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
          </div>
          <p className="text-sm font-medium text-foreground animate-pulse">Simulating date...</p>
        </div>
      )}

      {/* Top Image Section (40% height) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* Compatibility Badge (if completed) */}
        {status === "completed" && (
          <div className="absolute top-3 right-3">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md",
              "bg-background/90 text-foreground"
            )}>
              <span className={cn(
                compatibilityScore && compatibilityScore >= 75 ? "text-success" :
                compatibilityScore && compatibilityScore >= 50 ? "text-warning" : "text-destructive"
              )}>
                {compatibilityScore}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
            {name}, {age}
            {status === "completed" && <CheckCircle className="w-4 h-4 text-success" />}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{occupation.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{location.split(',')[0]}</span>
            </div>
          </div>
        </div>

        {/* Tags (Limit to 2 + count) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-[10px] px-2 h-5 bg-secondary/50 font-normal">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-2 h-5 border-dashed text-muted-foreground">
              +{tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Actions - Spacer to push buttons to bottom */}
        <div className="mt-auto pt-2">
          {status === "idle" && (
            <Button
              className="w-full rounded-xl h-10 gap-2 text-sm font-medium shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
              onClick={(e) => {
                e.stopPropagation();
                onRunSimulation(id);
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Preview
            </Button>
          )}
          
          {status === "completed" && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="w-full rounded-xl h-10 gap-2 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReport(match);
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                Report
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl h-10 gap-2 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/chat/${id}`);
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
