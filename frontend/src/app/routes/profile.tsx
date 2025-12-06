import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  MapPin,
  Heart,
  Shield,
  Star,
  MessageCircle,
  Briefcase,
  Compass,
  Users,
  DollarSign,
  Baby,
  Church,
  Globe,
  Clock,
  PawPrint,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/brand-logo";
import { getCurrentUser } from "@/lib/storage";
import { useCurrentUserProfile, useUpdateProfile } from "@/features/profiles/api/use-current-user-profile";
import type { FullProfile } from "@/features/profiles/types/profile-schema";
import ProfileEditor from "@/features/onboarding/components/profile-editor";

// ============================================================================
// Info Item Component
// ============================================================================

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
};

// ============================================================================
// Section Component
// ============================================================================

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

// ============================================================================
// Tag List Component
// ============================================================================

interface TagListProps {
  title: string;
  tags: string[];
  variant?: "default" | "destructive" | "success";
}

const TagList = ({ title, tags, variant = "default" }: TagListProps) => {
  if (!tags || tags.length === 0) return null;
  
  const variantClasses = {
    default: "bg-primary/10 text-primary border-primary/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  
  return (
    <div className="space-y-2">
      <h4 className="text-xs text-muted-foreground uppercase tracking-wide">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn("text-xs font-medium", variantClasses[variant])}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Profile View Component (Read-only)
// ============================================================================

interface ProfileViewProps {
  profile: FullProfile;
  onEdit: () => void;
}

const ProfileView = ({ profile, onEdit }: ProfileViewProps) => {
  const { profile: info, relationship, lifestyle, values, communication, empathy_accountability, dealbreakers, must_haves } = profile;
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 shadow-elevated overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-secondary relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50" />
        </div>
        <CardHeader className="relative pb-4">
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary ring-4 ring-background flex items-center justify-center">
            <User className="w-10 h-10 text-background" />
          </div>
          <div className="pt-14 flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{info.display_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{info.age} years old</span>
                {info.gender && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>{info.gender}</span>
                  </>
                )}
                {info.pronouns && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>{info.pronouns}</span>
                  </>
                )}
              </CardDescription>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{info.location}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Orientation */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-foreground">{info.orientation}</p>
          </div>
          
          <Separator />
          
          {/* Relationship Goals */}
          <Section title="Relationship Goals">
            <InfoItem 
              icon={<Heart className="w-4 h-4 text-primary" />} 
              label="Intent" 
              value={relationship.intent} 
            />
            <InfoItem 
              icon={<Clock className="w-4 h-4 text-primary" />} 
              label="Pace to Meet" 
              value={relationship.pace_to_meet} 
            />
          </Section>
          
          <Separator />
          
          {/* Lifestyle */}
          <Section title="Lifestyle">
            <InfoItem 
              icon={<Users className="w-4 h-4 text-primary" />} 
              label="Social Energy" 
              value={lifestyle.social_energy} 
            />
            <InfoItem 
              icon={<Compass className="w-4 h-4 text-primary" />} 
              label="Weekend Default" 
              value={lifestyle.weekend_default} 
            />
            <InfoItem 
              icon={<Globe className="w-4 h-4 text-primary" />} 
              label="Travel Style" 
              value={lifestyle.travel_style} 
            />
            <InfoItem 
              icon={<Briefcase className="w-4 h-4 text-primary" />} 
              label="Work-Life Balance" 
              value={lifestyle.work_life_balance} 
            />
            <InfoItem 
              icon={<PawPrint className="w-4 h-4 text-primary" />} 
              label="Pets" 
              value={lifestyle.pets} 
            />
          </Section>
          
          <Separator />
          
          {/* Values */}
          <Section title="Values">
            <InfoItem 
              icon={<Users className="w-4 h-4 text-primary" />} 
              label="Family Closeness" 
              value={values.family_closeness} 
            />
            <InfoItem 
              icon={<DollarSign className="w-4 h-4 text-primary" />} 
              label="Money Mindset" 
              value={values.money_mindset} 
            />
            <InfoItem 
              icon={<Baby className="w-4 h-4 text-primary" />} 
              label="Openness to Kids" 
              value={values.openness_to_kids} 
            />
            <InfoItem 
              icon={<Church className="w-4 h-4 text-primary" />} 
              label="Faith Importance" 
              value={values.faith_importance} 
            />
            <InfoItem 
              icon={<Globe className="w-4 h-4 text-primary" />} 
              label="Political Engagement" 
              value={values.political_engagement} 
            />
            <TagList title="Other Values" tags={values.other_values ?? []} />
          </Section>
          
          <Separator />
          
          {/* Communication */}
          <Section title="Communication Style">
            <InfoItem 
              icon={<MessageCircle className="w-4 h-4 text-primary" />} 
              label="Conflict Style" 
              value={communication.conflict_style} 
            />
            <InfoItem 
              icon={<Clock className="w-4 h-4 text-primary" />} 
              label="Texting Cadence" 
              value={communication.texting_cadence} 
            />
            <TagList title="Love Languages" tags={communication.love_languages ?? []} />
          </Section>
          
          <Separator />
          
          {/* Self-Reflection */}
          <Section title="Self-Reflection">
            <InfoItem 
              icon={<Heart className="w-4 h-4 text-primary" />} 
              label="Past Relationship Reflection" 
              value={empathy_accountability.past_relationship_reflection} 
            />
            <InfoItem 
              icon={<Shield className="w-4 h-4 text-primary" />} 
              label="Accountability Style" 
              value={empathy_accountability.accountability_style} 
            />
          </Section>
          
          <Separator />
          
          {/* Must-Haves & Dealbreakers */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-semibold text-foreground">Must-Haves</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {must_haves.map((item, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  >
                    {item}
                  </Badge>
                ))}
                {must_haves.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No must-haves specified</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                <h4 className="text-sm font-semibold text-foreground">Dealbreakers</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {dealbreakers.map((item, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20"
                  >
                    {item}
                  </Badge>
                ))}
                {dealbreakers.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No dealbreakers specified</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const ProfileSkeleton = () => (
  <Card className="border-primary/20 shadow-elevated overflow-hidden">
    <div className="h-24 bg-gradient-to-r from-muted to-muted/50" />
    <CardHeader className="relative pb-4">
      <Skeleton className="absolute -top-12 left-6 w-24 h-24 rounded-full" />
      <div className="pt-14 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <Separator />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ============================================================================
// Main Profile Page
// ============================================================================

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);
  
  // Fetch profile
  const { data: profile, isLoading, error } = useCurrentUserProfile(currentUser ?? undefined);
  const updateProfileMutation = useUpdateProfile();
  
  const handleSave = (updatedProfile: FullProfile) => {
    if (!currentUser) return;
    
    updateProfileMutation.mutate(
      { userId: currentUser, profile: updatedProfile },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (error) => {
          console.error("Failed to save profile:", error);
          // Still exit edit mode on error
          setIsEditing(false);
        },
      }
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center">
              <BrandLogo className="scale-[0.85]" />
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Profile" : "My Profile"}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {isLoading && <ProfileSkeleton />}
          
          {error && (
            <Card className="border-destructive/20">
              <CardContent className="py-12 text-center">
                <p className="text-destructive font-medium">Failed to load profile</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/dashboard")}
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
          
          {profile && !isEditing && (
            <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
          )}
          
          {profile && isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
              <ProfileEditor
                profile={profile}
                onSave={handleSave}
                isSaving={updateProfileMutation.isPending}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;

