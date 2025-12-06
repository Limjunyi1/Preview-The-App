import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md";

type BrandLogoProps = {
  showText?: boolean;
  text?: string;
  size?: BrandLogoSize;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

const iconSizes: Record<BrandLogoSize, string> = {
  sm: "w-6 h-6 rounded-md",
  md: "w-8 h-8 rounded-lg",
};

const textSizes: Record<BrandLogoSize, string> = {
  sm: "text-xl",
  md: "text-3xl",
};

const BrandLogo = ({
  showText = true,
  text = "review",
  size = "md",
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) => {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      <img
        src="/icon.svg"
        alt="Preview logo"
        className={cn(iconSizes[size], "object-contain", iconClassName)}
      />
      {showText && (
        <span
          className={cn(
            "font-serif font-semibold text-foreground leading-none relative -translate-y-[2px]",
            textSizes[size],
            textClassName
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;

