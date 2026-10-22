import Eyebrow from "@/components/Eyebrow";

/**
 * "From your desk head" note — sits above PrereqBox, framing the lesson as
 * an assigned task rather than a topic to read about. Pilot: only the
 * Options Pricing track has `deskBriefing` text for now (see lessons.ts).
 */
export default function DeskBriefing({ text }: { text: string }) {
  return (
    <div className="lesson-briefing">
      <Eyebrow className="mb-1.5">From your desk head</Eyebrow>
      <p className="lesson-briefing-text">{text}</p>
    </div>
  );
}
