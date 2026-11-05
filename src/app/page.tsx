export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          OrderHub Admin Console
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Scaffold Next.js 15 App Router running React 19, TypeScript strict,
          and Tailwind CSS.
        </p>
        <div className="mt-6 rounded-md bg-slate-100 p-3 text-xs font-mono text-slate-700">
          Status: Ready for Review (Session 01 / step-1)
        </div>
      </div>
    </main>
  );
}
