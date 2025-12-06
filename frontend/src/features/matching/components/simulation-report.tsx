import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  Heart, 
  AlertTriangle, 
  MessageSquare, 
  ThumbsDown, 
  Sparkles, 
  CheckCircle,
  TrendingUp,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Match } from "@/features/matching/types/match";
import type { SimulationRun } from "@/features/simulation/api/use-simulation";

interface SimulationReportProps {
  match: Match;
  simulationResult?: SimulationRun | null;
  onClose: () => void;
}

const SimulationReport = ({ match, simulationResult, onClose }: SimulationReportProps) => {
  const navigate = useNavigate();
  const { id, name, age, occupation, avatar, compatibilityScore = 78 } = match;

  // Get current user's agent name from conversation
  const currentUserAgent = simulationResult?.persona_a?.display_name?.toLowerCase() + "_agent";
  const matchAgent = simulationResult?.persona_b?.display_name?.toLowerCase() + "_agent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-2xl shadow-elevated overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">
                  Date Preview: You & {name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {age} • {occupation}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Compatibility Score */}
          <div className="p-6 border-b border-border">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-background border border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Simulated Date Vibe</h3>
                  <p className="text-sm text-muted-foreground">AI agents chatted based on your profiles</p>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg",
                  compatibilityScore >= 75 ? "bg-success/10 text-success" :
                  compatibilityScore >= 50 ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                )}>
                  <TrendingUp className="w-5 h-5" />
                  {compatibilityScore}%
                </div>
              </div>
              
              {/* Score Bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    compatibilityScore >= 75 ? "bg-success" :
                    compatibilityScore >= 50 ? "bg-warning" :
                    "bg-destructive"
                  )}
                  style={{ width: `${compatibilityScore}%` }}
                />
              </div>

              {/* Trailer Info */}
              {simulationResult?.trailer && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">High Point</span>
                    </div>
                    <p className="text-sm text-foreground">{simulationResult.trailer.high_point}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-xs font-medium text-warning">Friction Point</span>
                    </div>
                    <p className="text-sm text-foreground">{simulationResult.trailer.friction_point}</p>
                  </div>
                </div>
              )}

              {simulationResult?.trailer?.vibe && (
                <p className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Vibe:</span> {simulationResult.trailer.vibe}
                </p>
              )}
            </div>
          </div>

          {/* Conversation History */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Conversation Preview</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {simulationResult?.conversation?.length || 0} messages
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="bg-muted/30 rounded-2xl border border-border p-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {simulationResult?.conversation?.map((msg, index) => {
                    const isCurrentUser = msg.speaker === currentUserAgent;
                    const speakerName = isCurrentUser 
                      ? `You (${simulationResult.persona_a?.display_name})` 
                      : name;
                    
                    return (
                      <div 
                        key={index}
                        className={cn(
                          "flex gap-3",
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary"
                        )}>
                          {isCurrentUser ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <img 
                              src={avatar} 
                              alt={name} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={cn(
                          "max-w-[75%] group",
                          isCurrentUser ? "items-end" : "items-start"
                        )}>
                          <p className={cn(
                            "text-xs font-medium mb-1",
                            isCurrentUser ? "text-right text-primary" : "text-left text-muted-foreground"
                          )}>
                            {speakerName}
                          </p>
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                            isCurrentUser 
                              ? "bg-primary text-primary-foreground rounded-tr-md" 
                              : "bg-card border border-border text-foreground rounded-tl-md"
                          )}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {(!simulationResult?.conversation || simulationResult.conversation.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Sparkles className="w-8 h-8 mb-3 opacity-50" />
                      <p className="text-sm">No conversation data available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Icebreakers */}
            {simulationResult?.trailer?.icebreakers && simulationResult.trailer.icebreakers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Suggested Icebreakers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {simulationResult.trailer.icebreakers.map((icebreaker, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                    >
                      {icebreaker}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={onClose}>
              <ThumbsDown className="w-4 h-4" />
              Pass
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 gap-2"
              onClick={() => {
                onClose();
                navigate(`/chat/${id}`);
              }}
            >
              <Heart className="w-4 h-4" />
              Message {name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationReport;
