import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
      <p className="font-mono text-sm font-bold uppercase tracking-[0.4em] text-accent">Error 404</p>
      <h1 className="mt-5 text-4xl font-extrabold text-ink sm:text-5xl">
        This page left the grid.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        The product or page you were looking for is not in the NextNova catalogue. Search the
        marketplace or head back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary rounded-full px-6 py-3 text-sm font-bold">
          Back to marketplace
        </Link>
        <Link
          href="/#upcoming"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
        >
          Browse upcoming launches
        </Link>
      </div>
    </div>
  );
}
