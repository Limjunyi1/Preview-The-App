import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, Info, MapPin, ArrowLeft, Shield, Sparkles, Star, User, Settings, LogOut, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BrandLogo from "@/components/brand-logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SwipeDirection = "left" | "right";

type Profile = {
  id: number;
  name: string;
  age: number;
  pronouns: string;
  job: string;
  education: string;
  distance: string;
  photo: string;
  compatibility: number;
  shared: string[];
  friction: string;
  prompt: string;
  vibe: string;
};

type CardProps = Profile & {
  isFront: boolean;
  isFlipped: boolean;
  onSwipe: (id: number, dir: SwipeDirection) => void;
  onFlip: (id: number, flipped: boolean) => void;
};

const Swiping = () => {
  const [deckVersion, setDeckVersion] = useState(0);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [flippedId, setFlippedId] = useState<number | null>(null);

  const profiles = useMemo(() => seedProfiles.map((p, i) => ({ ...p, id: p.id + deckVersion * 100 + i })), [deckVersion]);
  const [cards, setCards] = useState<Profile[]>(profiles);

  useEffect(() => {
    setCards(profiles);
  }, [profiles]);

  const resetDeck = () => {
    setMatches([]);
    setFlippedId(null);
    setDeckVersion((v) => v + 1);
  };

  const handleSwipe = (id: number, dir: SwipeDirection) => {
    const card = cards.find((c) => c.id === id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    setFlippedId((current) => (current === id ? null : current));
    if (card && dir === "right") {
      setMatches((prev) => [card, ...prev.slice(0, 2)]);
    }
  };

  const frontId = cards[cards.length - 1]?.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-secondary/20 to-background px-4 pt-20 pb-6">
      {/* Header (dashboard style) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="px-3">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/" className="flex items-center">
              <BrandLogo className="scale-[0.9]" />
            </Link>
          </div>
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

      <div className="container mx-auto max-w-5xl">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
              <h1 className="text-3xl font-serif font-bold text-foreground">Swipe & Preview</h1>
            </div>
          </div>
          <div className="hidden" />
        </div>

        {/* Deck */}
        <div className="relative grid aspect-[5/4] w-full items-start pt-2 place-items-center overflow-hidden rounded-3xl">
          {cards.map((card) => (
            <ProfileCard
              key={card.id}
              {...card}
              isFront={card.id === frontId}
              isFlipped={card.id === flippedId}
              onSwipe={handleSwipe}
              onFlip={(id, flip) => setFlippedId(flip ? id : null)}
            />
          ))}
          {cards.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground -translate-y-4">
              <Sparkles className="w-5 h-5" />
              <p className="text-sm">All caught up. Reset to see more.</p>
            </div>
          )}

          {/* Controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[14%] flex items-center justify-center gap-4">
            <button
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-card ring-1 ring-border transition hover:scale-105"
              onClick={() => frontId && handleSwipe(frontId, "left")}
              aria-label="Pass"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>
            <button
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition hover:scale-110"
              onClick={() => frontId && handleSwipe(frontId, "right")}
              aria-label="Like"
            >
              <Heart className="h-7 w-7" />
            </button>
            <button
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-card ring-1 ring-border transition hover:scale-105"
              onClick={() => {
                const current = cards.find((c) => c.id === frontId);
                if (current) {
                  setFlippedId((prev) => (prev === current.id ? null : current.id));
                }
              }}
              aria-label="More info"
            >
              <Info className="h-6 w-6 text-foreground" />
            </button>
          </div>
        </div>

        {/* Match ribbon */}
        {matches.length > 0 && (
          <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Recent matches</h3>
              <Badge variant="secondary" className="bg-success/10 text-success">
                Auto from swipes
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {matches.map((match) => (
                <div key={match.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/80 p-3">
                  <img src={match.photo} alt={match.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{match.name}, {match.age}</p>
                    <p className="text-xs text-muted-foreground">{match.job}</p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      <Sparkles className="w-3 h-3" />
                      {match.compatibility}% match
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

const ProfileCard = ({
  id,
  name,
  age,
  pronouns,
  job,
  education,
  distance,
  photo,
  compatibility,
  shared,
  vibe,
  friction,
  prompt,
  isFront,
  isFlipped,
  onSwipe,
  onFlip,
}: CardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-120, 120], [-14, 14]);
  const opacity = useTransform(x, [-160, 0, 160], [0, 1, 0]);

  const handleDragEnd = () => {
    const xVal = x.get();
    if (Math.abs(xVal) > 100) {
      onSwipe(id, xVal > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      className={cn(
        "relative h-[78%] w-[80%] max-w-md select-none rounded-3xl shadow-elevated",
        isFront && "cursor-grab active:cursor-grabbing"
      )}
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        rotate,
        opacity,
        touchAction: "none",
      }}
      drag={isFront && !isFlipped ? "x" : false}
      dragConstraints={{ left: -1000, right: 1000 }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative h-full w-full [perspective:1600px]">
        <div
          className={cn(
            "relative h-full w-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d]",
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          )}
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-background [backface-visibility:hidden]">
            <img src={photo} alt={name} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white shadow-soft backdrop-blur">
              {compatibility}% match
            </div>
            <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-semibold">{name}, {age}</p>
                  <p className="text-sm text-white/80">{pronouns} • {distance}</p>
                  <p className="text-sm text-white/80">{job} • {education}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {shared.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{vibe}</span>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/30"
                  onClick={() => onFlip(id, true)}
                >
                  <Info className="h-4 w-4" />
                  More
                </button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-3xl border border-border bg-card p-5 text-foreground overflow-y-auto [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="flex items-center gap-3">
              <img src={photo} alt={name} className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <p className="text-lg font-semibold text-foreground">{name}, {age}</p>
                <p className="text-sm text-muted-foreground">{job} • {education}</p>
                <p className="text-xs text-muted-foreground">{distance}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-warning/20 text-warning">Compatibility {compatibility}%</Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">{pronouns}</Badge>
              <Badge variant="secondary" className="bg-secondary/20 text-foreground">{vibe}</Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-muted/60 p-4 border border-border">
                <h4 className="font-semibold text-foreground mb-1">Shared wins</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {shared.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>

              <div className="rounded-2xl bg-warning/10 p-4 border border-warning/30">
                <h4 className="font-semibold text-warning mb-1">Watch-out</h4>
                <p className="text-sm text-muted-foreground">{friction}</p>
              </div>

              <div className="rounded-2xl border border-border p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Prompt</p>
                  <p className="text-sm text-muted-foreground">{prompt}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" className="w-full gap-2" onClick={() => onFlip(id, false)}>
                <X className="w-4 h-4" />
                Back to photo
              </Button>
              <Button
                variant="hero"
                className="w-full gap-2"
                onClick={() => isFront && onSwipe(id, "right")}
                disabled={!isFront}
              >
                <Heart className="w-4 h-4" />
                Swipe right
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const seedProfiles: Profile[] = [
  {
    id: 1,
    name: "Maya",
    age: 27,
    pronouns: "She/Her",
    job: "Product Designer",
    education: "RISD",
    distance: "2.1 km away",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    compatibility: 87,
    shared: ["Both prefer balanced spending", "Weekend hikes", "Direct communicators"],
    friction: "She loves spontaneous travel; you prefer planning two months ahead.",
    prompt: "Two truths and a lie: I collect film cameras, I ran a marathon, I hate sushi.",
    vibe: "Coffee over cocktails",
  },
  {
    id: 2,
    name: "Elias",
    age: 30,
    pronouns: "He/Him",
    job: "Software Engineer",
    education: "MIT",
    distance: "4.5 km away",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    compatibility: 82,
    shared: ["Values financial transparency", "Reads sci-fi", "Morning runner"],
    friction: "Prefers city life; you're considering a move to the suburbs.",
    prompt: "Perfect Sunday? Long run, farmer's market, vinyls spinning.",
    vibe: "Sunrise runner",
  },
  {
    id: 3,
    name: "Priya",
    age: 29,
    pronouns: "She/Her",
    job: "Data Scientist",
    education: "Stanford",
    distance: "900 m away",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    compatibility: 90,
    shared: ["Aligned on savings goals", "Cooking nights in", "Asks thoughtful questions"],
    friction: "She likes taking the lead on plans; you prefer co-planning.",
    prompt: "Hot take: Board games tell you more about a person than their Myers-Briggs.",
    vibe: "Data + dumplings",
  },
  {
    id: 4,
    name: "Jamal",
    age: 26,
    pronouns: "He/Him",
    job: "Architect",
    education: "Columbia",
    distance: "1.8 km away",
    photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    compatibility: 75,
    shared: ["Minimalist aesthetics", "Prefers calm conflict style", "Sunday museum dates"],
    friction: "You like early mornings; he sketches late at night.",
    prompt: "My studio playlist is 90% lo-fi and 10% surprise salsa.",
    vibe: "Art & architecture",
  },
  {
    id: 5,
    name: "Zara",
    age: 28,
    pronouns: "She/Her",
    job: "Marketing Manager",
    education: "LSE",
    distance: "3.2 km away",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    compatibility: 85,
    shared: ["Loves weekend markets", "Values work-life balance", "Enjoys deep conversations"],
    friction: "She's a night owl; you prefer early mornings for productivity.",
    prompt: "Currently reading three books at once and somehow keeping track of all the plots.",
    vibe: "Books & brunch",
  },
  {
    id: 6,
    name: "Alex",
    age: 32,
    pronouns: "He/Him",
    job: "Head Chef",
    education: "Culinary Institute",
    distance: "5.8 km away",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=80",
    compatibility: 78,
    shared: ["Foodie adventures", "Values quality time", "Weekend cooking experiments"],
    friction: "He works late nights; you prefer consistent schedules.",
    prompt: "I can make a five-course meal from whatever's in your fridge. Challenge accepted?",
    vibe: "Farm to table",
  },
  {
    id: 7,
    name: "Kai",
    age: 25,
    pronouns: "They/Them",
    job: "Environmental Scientist",
    education: "UBC",
    distance: "2.7 km away",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    compatibility: 92,
    shared: ["Sustainability focused", "Outdoor adventures", "Thoughtful communicator"],
    friction: "They prefer camping trips; you like comfortable accommodations.",
    prompt: "My ideal date involves hiking boots and discovering hidden waterfalls.",
    vibe: "Nature & mindfulness",
  },
  {
    id: 8,
    name: "Luna",
    age: 24,
    pronouns: "She/Her",
    job: "Travel Photographer",
    education: "Art Institute",
    distance: "6.1 km away",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    compatibility: 73,
    shared: ["Creative pursuits", "Loves storytelling", "Values authenticity"],
    friction: "She travels frequently for work; you prefer stability and routine.",
    prompt: "I've captured sunrises in 12 countries, but my favorite shot is still from my hometown.",
    vibe: "Wanderlust & art",
  },
  {
    id: 9,
    name: "Diego",
    age: 31,
    pronouns: "He/Him",
    job: "Music Producer",
    education: "Berklee",
    distance: "4.3 km away",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
    compatibility: 80,
    shared: ["Music enthusiast", "Creative collaboration", "Values emotional expression"],
    friction: "He's most creative at night; you're a morning person.",
    prompt: "Currently working on a track that blends bossa nova with electronic beats. It shouldn't work, but it does.",
    vibe: "Rhythm & soul",
  },
];

export default Swiping;

