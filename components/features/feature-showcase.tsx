
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { memo } from "react";

// Import CSS for animations
import "./feature-showcase.css";

// Define the type for a single feature, mirroring the structure in the page file
// It's often good practice to define shared types in a dedicated types file (e.g., types/index.ts)
// But for simplicity here, we'll redefine it.
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string; // Used for dynamic styling
  image: string;
  benefits: string[];
  buttonText: string;
}

interface FeatureShowcaseProps {
  feature: Feature;
  index: number;
}

// Simple card component - extracted for reusability
function FeatureShowcaseComponent({ feature, index }: FeatureShowcaseProps) {
  const isEven = index % 2 === 0;
  // Basic scroll animation setup (can be enhanced with IntersectionObserver later if needed)
  const animationDelay = `${index * 100}ms`;

  // Note: Handling dynamic Tailwind classes like `bg-${feature.colorClass}-500/10`
  // might require safelisting in tailwind.config.ts or using a mapping approach.
  // This code assumes one of those methods is in place.

  // Use CSS variables for animation delay to avoid inline styles
  return (
    <>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16 group animate-fade-in-up`}
        style={{ '--animation-delay': animationDelay } as React.CSSProperties}
      >
        {/* Text Content */}
        <div className={`space-y-6 ${isEven ? "md:order-1" : "md:order-2"}`}>
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${feature.colorClass}-500/10`}>
            {feature.icon}
          </div>
          <h3 className={`text-3xl font-bold tracking-tight text-${feature.colorClass}-400`}>{feature.title}</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
          <ul className="space-y-3">
            {feature.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className={`h-5 w-5 text-${feature.colorClass}-500/80 mt-1 flex-shrink-0`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className={`border-${feature.colorClass}-500/30 text-${feature.colorClass}-400 hover:bg-${feature.colorClass}-500/10 hover:text-${feature.colorClass}-300 group`} asChild>
            <Link href="/signup">
              {feature.buttonText} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Visual Representation */}
        <div className={`relative rounded-xl overflow-hidden border-2 border-muted/20 shadow-xl transition-all duration-500 group-hover:border-${feature.colorClass}-500/40 group-hover:shadow-${feature.colorClass}-500/10 group-hover:scale-[1.02] ${isEven ? "md:order-2" : "md:order-1"}`}>
          <div className={`absolute inset-0 bg-gradient-to-br from-${feature.colorClass}-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          {/* Use next/image for optimized images */}
          <Image
            src={feature.image}
            alt={`${feature.title} visual representation`}
            width={400}
            height={300}
            className="object-cover w-full aspect-[4/3]"
            priority={index < 2} // Prioritize loading for the first couple of features
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index < 2 ? "high" : "auto"}
          />
          <div className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-border/50">
            Feature Visual
          </div>
        </div>
      </div>

      {/* No styled-jsx in server components - using global styles instead */}
    </>
  );
}

// Use React.memo to prevent unnecessary re-renders
// Only re-render if props actually change
const FeatureShowcase = memo(FeatureShowcaseComponent, (prevProps, nextProps) => {
  return (
    prevProps.feature.title === nextProps.feature.title && 
    prevProps.index === nextProps.index
  );
});

export default FeatureShowcase;
