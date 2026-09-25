/** The banner at the top of every page. Text and on/off switch live in Site settings. */
export function SampleBanner({ text }: { text: string }) {
  return (
    <div role="note" className="bg-night-deep px-4 py-2 text-center text-micro text-peach">
      {text}
    </div>
  )
}

/** Shown while a logged-in editor is looking at drafts through the admin's Preview button. */
export function PreviewBar() {
  return (
    <div role="status" className="sticky top-0 z-40 bg-night-deep px-4 py-2 text-center text-caption text-aqua">
      Preview: you’re seeing drafts that readers can’t see yet.{' '}
      {/* A full page load, not a client-side <Link>: /exit-preview is a route handler that clears
          the draft-mode cookie and redirects. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/exit-preview" className="text-white underline underline-offset-4">
        Exit preview
      </a>
    </div>
  )
}
