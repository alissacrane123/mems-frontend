export function BoardNux() {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2h12a2 2 0 012 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        No boards yet
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Create your first family board or join an existing one.
      </p>
    </div>
  );
}
