/**
 * Renders a schema.org JSON-LD block. Server-only by design — the payload has
 * to be in the initial HTML for crawlers that don't run scripts.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
