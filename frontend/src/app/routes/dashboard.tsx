import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Sparkles, ChevronLeft, ChevronRight, User, Settings, LogOut, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import MatchCard from "@/features/matching/components/match-card";
import SimulationReport from "@/features/matching/components/simulation-report";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BrandLogo from "@/components/brand-logo";
import { mockMatches } from "@/features/matching/testing/mocks/matches";
import type { Match } from "@/features/matching/types/match";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

const Dashboard = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "bot-1",
      sender: "bot",
      text: "Hi! I'm Ur AI Bestie. I can suggest matches, queue a swipe session, or answer quick questions."
    },
    {
      id: "bot-2",
      sender: "bot",
      text: "Try asking “Who should I simulate next?” or tap Swipe to jump in."
    }
  ]);
  const navigate = useNavigate();

  const handleRunSimulation = (matchId: string) => {
    setMatches(prev => 
      prev.map(m => 
        m.id === matchId ? { ...m, status: "simulating" as const } : m
      )
    );

    // Simulate the AI processing
    setTimeout(() => {
      setMatches(prev =>
        prev.map(m =>
          m.id === matchId
            ? { ...m, status: "completed" as const, compatibilityScore: Math.floor(Math.random() * 30) + 65 }
            : m
        )
      );
    }, 4000);
  };

  const handleViewReport = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleSendChat = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const nextMessage = chatInput.trim();
    if (!nextMessage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: nextMessage
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "Got it! Want me to line up a swipe session or run a simulation on a match?"
        }
      ]);
    }, 450);
  };

  const quickActions = [
    {
      label: "Start swiping",
      onClick: () => navigate("/swiping")
    },
    {
      label: "Run a simulation",
      onClick: () => {
        setIsChatOpen(true);
        setChatMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: "Tell me which match you'd like to simulate, and I'll queue it up."
          }
        ]);
      }
    }
  ];

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedMatches = filteredMatches.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandLogo className="-ml-16 scale-[0.85]" />
          </Link>
          <div className="flex items-center gap-4 -mr-14">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center"
                    aria-label="Open user menu"
                  >
                    <User className="w-5 h-5 text-background" />
                    <span className="sr-only">Open user menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" sideOffset={8}>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>View profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center gap-2 text-destructive">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            "relative fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-40",
            filtersOpen
              ? "w-72 translate-x-0 overflow-y-auto overflow-x-visible"
              : "-translate-x-full w-0 lg:w-0 lg:-translate-x-full overflow-hidden"
          )}
        >
          <div
            className={cn(
              "p-6 space-y-6 h-full transition-opacity duration-200",
              filtersOpen ? "opacity-100" : "opacity-0 pointer-events-none lg:pointer-events-none"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Age Range</label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="25" className="w-20" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="number" placeholder="40" className="w-20" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                <Input placeholder="Any location" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Key Values</label>
                <div className="flex flex-wrap gap-2">
                  {["Family-oriented", "Career-driven", "Adventurous", "Creative", "Fitness"].map(tag => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Simulation Status</label>
                <div className="space-y-2">
                  {["All Matches", "Ready to Preview", "Completed"].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" className="text-primary" />
                      <span className="text-sm text-foreground">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button variant="default" className="w-full">Apply Filters</Button>
            </div>
          </div>
        </aside>

        {filtersOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] lg:hidden z-30"
            onClick={() => setFiltersOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-label={filtersOpen ? "Collapse filters" : "Expand filters"}
            >
              {filtersOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="w-5 h-5" />
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              className="ml-auto"
              variant="default"
              onClick={() => navigate("/swiping")}
            >
              Swipe
            </Button>
          </div>

          {/* Match Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-items-center">
            {paginatedMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onRunSimulation={handleRunSimulation}
                onViewReport={handleViewReport}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-end gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1 || filteredMatches.length === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || filteredMatches.length === 0}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </main>

      </div>

      {/* Simulation Report Modal */}
      {selectedMatch && (
        <SimulationReport
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* Chatbot Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/25">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">AI Bestie</p>
                <p className="text-xs text-muted-foreground">Personalized dating copilot</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-3 p-4">
            {chatMessages.map(message => (
              <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-3 space-y-2">
            <div className="flex gap-2">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="text-xs px-3 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition"
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything or say hi..."
                className="flex-1"
                aria-label="Chat message"
              />
              <Button type="submit" size="icon" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 z-50 rounded-full px-5 py-4 shadow-xl shadow-primary/25 bg-gradient-to-br from-primary to-secondary text-primary-foreground hover:shadow-2xl hover:-translate-y-0.5 transition"
        size="lg"
        onClick={() => setIsChatOpen((open) => !open)}
        aria-label="AI Bestie"
        aria-expanded={isChatOpen}
        title="AI Bestie"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">AI Bestie</span>
      </Button>
    </div>
  );
};

export default Dashboard;
