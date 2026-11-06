export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-page-title text-foreground">
          OrderHub Admin Console
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          B2B operations dashboard running Next.js 15 App Router, React 19,
          TypeScript strict, and Tailwind CSS design tokens.
        </p>
        <div className="mt-6 rounded-md border border-border bg-muted p-3 text-caption font-mono text-muted-foreground">
          Status: Design Tokens &amp; Visual Baseline Applied (Session 02 /
          step-2)
        </div>
      </div>
    </main>
  );
}
