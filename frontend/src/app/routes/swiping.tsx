import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, Info, MapPin, ArrowLeft, Shield, Sparkles, Star, User, Settings, LogOut, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BrandLogo from "@/components/brand-logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSwipeProfiles } from "@/features/profiles/api/get-profiles";
import type { SwipeProfile } from "@/features/profiles/types/swipe-profile";
import { useRecordSwipe } from "@/features/swiping/api/use-swipes";
import { getCurrentUser, getUnswipedProfiles, clearSwipesForUser } from "@/lib/storage";

type SwipeDirection = "left" | "right";

// Use the SwipeProfile type from the profiles feature
type Profile = SwipeProfile & {
  numericId: number; // Keep track of numeric ID for card tracking
};

type CardProps = Profile & {
  isFront: boolean;
  isFlipped: boolean;
  onSwipe: (id: number, dir: SwipeDirection) => void;
  onFlip: (id: number, flipped: boolean) => void;
};

const Swiping = () => {
  const navigate = useNavigate();
  const [recentMatches, setRecentMatches] = useState<Profile[]>([]);
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [showMatchCelebration, setShowMatchCelebration] = useState<Profile | null>(null);
  const [resetNonce, setResetNonce] = useState(0);

  // Get current user from localStorage
  const currentUser = getCurrentUser();

  // Redirect to login if no current user, or questionnaire if old user format
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.startsWith("user-")) {
      // Old format user ID - needs re-onboarding
      navigate("/questionnaire");
    }
  }, [currentUser, navigate]);

  // Fetch real profile data
  const { data: swipeProfiles, isLoading, error } = useSwipeProfiles();

  // Record swipe mutation
  const recordSwipeMutation = useRecordSwipe();

  // Filter to only show unswiped profiles and transform to Profile[] with numeric IDs
  const profiles = useMemo(() => {
    if (!swipeProfiles || !currentUser) return [];
    const allProfileIds = swipeProfiles.map((p) => p.id);
    const unswipedIds = getUnswipedProfiles(currentUser, allProfileIds);
    return swipeProfiles
      .filter((p) => unswipedIds.includes(p.id))
      .map((p, i) => ({
        ...p,
        numericId: i,
      }));
  }, [swipeProfiles, currentUser, resetNonce]);

  const [cards, setCards] = useState<Profile[]>(profiles);

  useEffect(() => {
    if (profiles.length > 0) {
      setCards(profiles);
    }
  }, [profiles]);

  const handleSwipe = (id: number, dir: SwipeDirection) => {
    const card = cards.find((c) => c.numericId === id);
    if (!card || !currentUser) return;

    // Record the swipe in localStorage
    recordSwipeMutation.mutate(
      { from: currentUser, to: card.id, direction: dir },
      {
        onSuccess: ({ isMatch }) => {
          if (isMatch && dir === "right") {
            // Show match celebration
            setShowMatchCelebration(card);
            setRecentMatches((prev) => [card, ...prev.slice(0, 2)]);
          }
        },
      }
    );

    // Remove card from deck immediately for smooth UX
    setCards((prev) => prev.filter((c) => c.numericId !== id));
    setFlippedId((current) => (current === id ? null : current));
  };

  const frontId = cards[cards.length - 1]?.numericId;

  const handleResetDeck = () => {
    if (!currentUser) return;
    clearSwipesForUser(currentUser);
    setResetNonce((n) => n + 1);
    setCards(profiles);
    setFlippedId(null);
    setShowMatchCelebration(null);
    setRecentMatches([]);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error loading profiles</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-secondary/20 to-background px-4 pt-20 pb-6">
      {/* Header (dashboard style) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <div>
            <Button variant="outline" size="sm" onClick={handleResetDeck}>
              Reset deck
            </Button>
          </div>
        </div>

        {/* Deck */}
        <div className="relative grid aspect-[5/4] w-full items-start pt-2 place-items-center overflow-hidden rounded-3xl">
          {cards.map((card) => (
            <ProfileCard
              key={card.numericId}
              {...card}
              isFront={card.numericId === frontId}
              isFlipped={card.numericId === flippedId}
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
                const current = cards.find((c) => c.numericId === frontId);
                if (current) {
                  setFlippedId((prev) => (prev === current.numericId ? null : current.numericId));
                }
              }}
              aria-label="More info"
            >
              <Info className="h-6 w-6 text-foreground" />
            </button>
          </div>
        </div>

        {/* Match ribbon */}
        {recentMatches.length > 0 && (
          <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Recent matches</h3>
              <Badge variant="secondary" className="bg-success/10 text-success">
                It's a match!
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {recentMatches.map((match) => (
                <Link
                  key={match.numericId}
                  to={`/chat/${match.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/80 p-3 hover:border-primary transition-colors"
                >
                  <img src={match.photo} alt={match.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{match.name}, {match.age}</p>
                    <p className="text-xs text-muted-foreground">{match.job}</p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      <Sparkles className="w-3 h-3" />
                      {match.compatibility}% match
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match Celebration Modal */}
      {showMatchCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-sm w-full bg-card rounded-3xl p-8 text-center shadow-elevated animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">It's a Match!</h2>
            <p className="text-muted-foreground mb-6">
              You and {showMatchCelebration.name} liked each other
            </p>
            <img
              src={showMatchCelebration.photo}
              alt={showMatchCelebration.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary mb-6"
            />
            <div className="grid gap-3">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  navigate(`/chat/${showMatchCelebration.id}`);
                }}
              >
                Send a message
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMatchCelebration(null)}
              >
                Keep swiping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileCard = ({
  numericId,
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
      onSwipe(numericId, xVal > 0 ? "right" : "left");
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
                  onClick={() => onFlip(numericId, true)}
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
              <Button variant="outline" className="w-full gap-2" onClick={() => onFlip(numericId, false)}>
                <X className="w-4 h-4" />
                Back to photo
              </Button>
              <Button
                variant="hero"
                className="w-full gap-2"
                onClick={() => isFront && onSwipe(numericId, "right")}
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

export default Swiping;

