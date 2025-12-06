import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Heart, 
  AlertTriangle, 
  MessageSquare, 
  ThumbsDown, 
  Sparkles, 
  CheckCircle,
  Database,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match } from "@/features/matching/types/match";

interface SimulationReportProps {
  match: Match;
  onClose: () => void;
}

const SimulationReport = ({ match, onClose }: SimulationReportProps) => {
  const { name, age, occupation, avatar, compatibilityScore = 78 } = match;

  const highPoints = [
    {
      title: "Aligned on Work-Life Balance",
      dialogue: [
        { speaker: "Your Agent", message: "I really value having time for personal hobbies outside of work. It keeps me grounded." },
        { speaker: `${name}'s Agent`, message: "Absolutely! I believe productivity comes from being well-rested and fulfilled. Weekends are sacred." }
      ]
    },
    {
      title: "Similar Communication Styles",
      dialogue: [
        { speaker: `${name}'s Agent`, message: "When something's bothering me, I prefer to address it directly but with empathy." },
        { speaker: "Your Agent", message: "Same here! I'd rather have a difficult conversation early than let resentment build." }
      ]
    }
  ];

  const frictionPoints = [
    {
      title: "Different Financial Priorities",
      description: "While you prioritize saving for long-term goals, they tend to focus more on experiences and present enjoyment.",
      dialogue: [
        { speaker: "Your Agent", message: "I like to save at least 30% of my income before considering discretionary spending." },
        { speaker: `${name}'s Agent`, message: "Life's too short! I prefer investing in experiences and memories while I can." }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-background rounded-2xl shadow-elevated overflow-hidden animate-scale-in">
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
                  Simulation Report: {name}
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
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-8">
          {/* Compatibility Score */}
          <div className="p-6 rounded-2xl gradient-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Simulated Date Vibe</h3>
                <p className="text-sm text-muted-foreground">Based on your values questionnaires</p>
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
            
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Judge's Summary:</span> Your simulated 
              first date showed strong emotional intelligence from both sides, with natural rapport 
              building around shared lifestyle values. Some financial philosophy differences emerged 
              but were discussed respectfully.
            </p>
          </div>

          {/* High Points */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">High Points</h3>
              <Badge variant="secondary" className="bg-success/10 text-success">Green Flags</Badge>
            </div>
            
            <div className="space-y-4">
              {highPoints.map((point, index) => (
                <div key={index} className="p-4 rounded-xl bg-success/5 border border-success/20">
                  <h4 className="font-medium text-foreground mb-3">{point.title}</h4>
                  <div className="space-y-2">
                    {point.dialogue.map((line, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex gap-2",
                          line.speaker === "Your Agent" ? "flex-row" : "flex-row-reverse"
                        )}
                      >
                        <div className={cn(
                          "max-w-[80%] p-3 rounded-xl text-sm",
                          line.speaker === "Your Agent" 
                            ? "bg-primary/10 rounded-tl-none" 
                            : "bg-secondary/10 rounded-tr-none"
                        )}>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {line.speaker}
                          </p>
                          <p className="text-foreground">{line.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friction Points */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Friction Points</h3>
              <Badge variant="secondary" className="bg-warning/10 text-warning">Yellow Flags</Badge>
            </div>
            
            <div className="space-y-4">
              {frictionPoints.map((point, index) => (
                <div key={index} className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <h4 className="font-medium text-foreground mb-2">{point.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{point.description}</p>
                  <div className="space-y-2">
                    {point.dialogue.map((line, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex gap-2",
                          line.speaker === "Your Agent" ? "flex-row" : "flex-row-reverse"
                        )}
                      >
                        <div className={cn(
                          "max-w-[80%] p-3 rounded-xl text-sm",
                          line.speaker === "Your Agent" 
                            ? "bg-primary/10 rounded-tl-none" 
                            : "bg-secondary/10 rounded-tr-none"
                        )}>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {line.speaker}
                          </p>
                          <p className="text-foreground">{line.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Tool Use */}
          <div className="p-4 rounded-xl bg-muted border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Agent Tool Usage</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Queried: Financial values
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Queried: Lifestyle preferences
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Queried: Communication style
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={onClose}>
              <ThumbsDown className="w-4 h-4" />
              Pass
            </Button>
            <Button variant="hero" className="flex-1 gap-2">
              <MessageSquare className="w-4 h-4" />
              Message {name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationReport;
