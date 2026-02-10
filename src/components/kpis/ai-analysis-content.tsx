/**
 * Renderiza el texto del análisis IA en un formato consistente:
 * - Negritas reales (sin markdown)
 * - Lista para recomendaciones
 * - Emojis discretos por sección
 */
export function AiAnalysisContent({ text }: { text: string | null }) {
  if (!text) return null;

  const cleaned = text.replace(/\*\*/g, "").trim();
  if (!cleaned) return null;

  const emojiFor: Record<string, string> = {
    Tendencia: "📈",
    Recomendaciones: "✅",
    Nota: "📝",
  };

  const lines = cleaned.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="list-disc pl-5 space-y-1">
          {listItems.map((li, idx) => (
            <li key={idx}>{li}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      nodes.push(<div key={`sp-${nodes.length}`} className="h-2" />);
      continue;
    }

    const bullet = /^-\s+(.*)$/.exec(line);
    if (bullet) {
      listItems.push(bullet[1]);
      continue;
    }

    flushList();

    const kv = /^([A-Za-zÁÉÍÓÚÑáéíóúñ ]+):\s*(.*)$/.exec(line);
    if (kv) {
      const key = kv[1].trim();
      const value = kv[2]?.trim() ?? "";
      const emoji = emojiFor[key] ? `${emojiFor[key]} ` : "";
      nodes.push(
        <p key={`p-${nodes.length}`} className="text-sm leading-relaxed">
          <strong>
            {emoji}
            {key}:
          </strong>{" "}
          {value}
        </p>
      );
      continue;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} className="text-sm leading-relaxed">
        {line}
      </p>
    );
  }

  flushList();
  return <div className="space-y-2">{nodes}</div>;
}
