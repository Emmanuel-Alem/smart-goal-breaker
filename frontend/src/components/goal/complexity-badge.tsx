interface ComplexityBadgeProps {
  score: number;
}

export function ComplexityBadge({ score }: ComplexityBadgeProps) {
  const getStyles = (score: number) => {
    if (score <= 3) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score <= 6) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
  };

  const getLabel = (score: number) => {
    if (score <= 3) return "Easy";
    if (score <= 6) return "Medium";
    return "Hard";
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles(score)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {getLabel(score)} ({score}/10)
    </span>
  );
}
