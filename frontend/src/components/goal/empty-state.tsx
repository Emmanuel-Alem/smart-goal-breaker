import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="w-full max-w-md text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-foreground">
        What would you like to achieve?
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Enter any goal above and our AI will break it down into 5 clear, actionable steps to help you get started.
      </p>
    </div>
  );
}
