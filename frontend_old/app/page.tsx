export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12 sm:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="rounded-3xl border border-border bg-card/80 p-10 shadow-xl shadow-black/5 backdrop-blur-xl">
          <span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground">
            GreenGru
          </span>
          <h1 className="mt-8 text-4xl font-bold sm:text-5xl">Steel SME Carbon Passport</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            This frontend is the home page for the Carbon Passport MVP. It confirms the Next.js app is running and can be extended with data intake, document generation, and backend API integration.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/90 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Status</p>
              <p className="mt-3 text-xl font-semibold">Running</p>
              <p className="mt-2 text-sm text-muted-foreground">Frontend served on port 3000.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/90 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Backend</p>
              <p className="mt-3 text-xl font-semibold">Available</p>
              <p className="mt-2 text-sm text-muted-foreground">Backend API expected at port 8000.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/90 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Next Step</p>
              <p className="mt-3 text-xl font-semibold">Build UI</p>
              <p className="mt-2 text-sm text-muted-foreground">Edit <code className="rounded bg-black/5 px-1 py-0.5">app/page.tsx</code> to add your project UI.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-10 shadow-xl shadow-black/5 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold">Ready for project content</h2>
          <ul className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
            <li>• Replace this page with your Carbon Passport form and report preview components.</li>
            <li>• Use the backend API for document generation and score calculations.</li>
            <li>• Keep your page in <code className="rounded bg-black/5 px-1 py-0.5">app/page.tsx</code> or add nested routes under <code className="rounded bg-black/5 px-1 py-0.5">app/</code>.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
