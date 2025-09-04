"use client"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Unable to load group</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {error?.message || "We couldn't load this group right now."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center rounded-md bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
