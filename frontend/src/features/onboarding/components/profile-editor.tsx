import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  MapPin, 
  Heart, 
  Shield, 
  Star, 
  Sparkles,
  X,
  Plus,
  Loader2,
  Check,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FullProfile } from "@/features/profiles/types/profile-schema";

interface ProfileEditorProps {
  profile: FullProfile;
  onSave: (updatedProfile: FullProfile) => void;
  isSaving?: boolean;
}

// ============================================================================
// Tag Input Component
// ============================================================================

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput = memo(({ tags, onTagsChange, placeholder = "Add item...", maxTags = 10 }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onTagsChange([...tags, trimmed]);
      setInputValue("");
    }
  }, [inputValue, tags, maxTags, onTagsChange]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  }, [tags, onTagsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="px-3 py-1 text-sm flex items-center gap-1 hover:bg-secondary/80 transition-colors"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={tags.length >= maxTags}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTag}
          disabled={!inputValue.trim() || tags.length >= maxTags}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">Maximum {maxTags} items reached</p>
      )}
    </div>
  );
});
TagInput.displayName = "TagInput";

// ============================================================================
// Section Component
// ============================================================================

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Section = memo(({ icon, title, description, children }: SectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    <div className="pl-10">
      {children}
    </div>
  </div>
));
Section.displayName = "Section";

// ============================================================================
// Main Profile Editor Component
// ============================================================================

const ProfileEditor = ({ profile, onSave, isSaving = false }: ProfileEditorProps) => {
  // Local state for editable fields
  const [displayName, setDisplayName] = useState(profile.profile.display_name);
  const [age, setAge] = useState(profile.profile.age);
  const [location, setLocation] = useState(profile.profile.location);
  const [orientation, setOrientation] = useState(profile.profile.orientation);
  const [relationshipIntent, setRelationshipIntent] = useState(profile.relationship.intent);
  const [otherValues, setOtherValues] = useState<string[]>(profile.values.other_values ?? []);
  const [dealbreakers, setDealbreakers] = useState<string[]>(profile.dealbreakers);
  const [mustHaves, setMustHaves] = useState<string[]>(profile.must_haves);

  const handleSave = useCallback(() => {
    const updatedProfile: FullProfile = {
      ...profile,
      profile: {
        ...profile.profile,
        display_name: displayName,
        age,
        location,
        orientation,
      },
      relationship: {
        ...profile.relationship,
        intent: relationshipIntent,
      },
      values: {
        ...profile.values,
        other_values: otherValues,
      },
      dealbreakers,
      must_haves: mustHaves,
    };
    onSave(updatedProfile);
  }, [profile, displayName, age, location, orientation, relationshipIntent, otherValues, dealbreakers, mustHaves, onSave]);

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 shadow-elevated overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Almost there! Review your profile</CardTitle>
          </div>
          <CardDescription>
            Quick check - make sure everything looks good, then start swiping to find your matches!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Info Section */}
          <Section
            icon={<User className="w-4 h-4 text-primary" />}
            title="Basic Information"
            description="Your public profile details"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  min={18}
                  max={100}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="orientation">Looking For</Label>
                <Textarea
                  id="orientation"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  placeholder="What kind of relationship are you seeking?"
                  rows={2}
                />
              </div>
            </div>
          </Section>

          <Separator />

          {/* Relationship Intent */}
          <Section
            icon={<Heart className="w-4 h-4 text-primary" />}
            title="Relationship Goals"
            description="What you're looking for in a partner"
          >
            <div className="space-y-2">
              <Label htmlFor="intent">Your Intent</Label>
              <Textarea
                id="intent"
                value={relationshipIntent}
                onChange={(e) => setRelationshipIntent(e.target.value)}
                placeholder="Describe what you're looking for..."
                rows={3}
              />
            </div>
          </Section>

          <Separator />

          {/* Values */}
          <Section
            icon={<Star className="w-4 h-4 text-primary" />}
            title="Your Values"
            description="What matters most to you"
          >
            <TagInput
              tags={otherValues}
              onTagsChange={setOtherValues}
              placeholder="Add a value (e.g., Honesty, Family, Adventure)"
            />
          </Section>

          <Separator />

          {/* Must Haves */}
          <Section
            icon={<Check className="w-4 h-4 text-primary" />}
            title="Must-Haves"
            description="Essential qualities in a partner"
          >
            <TagInput
              tags={mustHaves}
              onTagsChange={setMustHaves}
              placeholder="Add a must-have (e.g., Emotional maturity)"
            />
          </Section>

          <Separator />

          {/* Dealbreakers */}
          <Section
            icon={<Shield className="w-4 h-4 text-primary" />}
            title="Dealbreakers"
            description="Things you cannot accept in a relationship"
          >
            <TagInput
              tags={dealbreakers}
              onTagsChange={setDealbreakers}
              placeholder="Add a dealbreaker (e.g., Dishonesty)"
            />
          </Section>

          {/* Action Button */}
          <div className="pt-6 flex justify-center">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className={cn(
                "px-10 py-6 text-lg font-semibold transition-all duration-200",
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:from-primary/90 hover:to-primary/80",
                "shadow-elevated hover:shadow-2xl hover:scale-105"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Start Swiping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            You can always update your profile later from settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditor;

