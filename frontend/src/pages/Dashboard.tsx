import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Sparkles, Clock, Users, ChevronLeft, ChevronRight, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import MatchCard from "@/components/MatchCard";
import SimulationReport from "@/components/SimulationReport";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BrandLogo from "@/components/BrandLogo";

export interface Match {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  avatar: string;
  tags: string[];
  status: "idle" | "simulating" | "completed";
  compatibilityScore?: number;
}

const mockMatches: Match[] = [
  {
    id: "1",
    name: "Jordan",
    age: 28,
    occupation: "Product Designer",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    tags: ["Family-oriented", "Creative", "Adventurous"],
    status: "idle"
  },
  {
    id: "2",
    name: "Alex",
    age: 31,
    occupation: "Software Engineer",
    location: "New York, NY",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    tags: ["Career-driven", "Analytical", "Fitness enthusiast"],
    status: "completed",
    compatibilityScore: 84
  },
  {
    id: "3",
    name: "Sam",
    age: 29,
    occupation: "Marketing Manager",
    location: "Los Angeles, CA",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    tags: ["Social butterfly", "Travel lover", "Foodie"],
    status: "idle"
  },
  {
    id: "4",
    name: "Taylor",
    age: 32,
    occupation: "Entrepreneur",
    location: "Austin, TX",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    tags: ["Ambitious", "Family-focused", "Outdoor enthusiast"],
    status: "idle"
  },
  {
    id: "5",
    name: "Morgan",
    age: 27,
    occupation: "Teacher",
    location: "Seattle, WA",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    tags: ["Nurturing", "Creative", "Book lover"],
    status: "completed",
    compatibilityScore: 72
  },
  {
    id: "6",
    name: "Casey",
    age: 30,
    occupation: "Healthcare Professional",
    location: "Chicago, IL",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    tags: ["Caring", "Stable", "Active lifestyle"],
    status: "idle"
  }
];

const Dashboard = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pageSize = 5;
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Dashboard;
