interface RichContentProps {
  text?: string | null;
  className?: string;
}

/** Renders CMS plain text with proper paragraphs and line-breaks. */
export function RichContent({ text, className = "" }: RichContentProps) {
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`space-y-4 leading-relaxed ${className}`}>
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-line text-foreground/90">{para}</p>
      ))}
    </div>
  );
}
