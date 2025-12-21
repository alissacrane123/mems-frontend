interface JournalEntryProps {
  id: string;
  content: string;
  date: string;
  time: string;
  location: string;
  photos?: string[];
}

export default function JournalEntry({
  id,
  content,
  date,
  time,
  location,
  photos = []
}: JournalEntryProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{time}</span>
          </div>
        </div>
        {location && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[200px]">{location}</span>
          </div>
        )}
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>

      {photos && photos.length > 0 && (
        <div className="mt-4">
          <div
            className={`grid gap-3 ${
              photos.length === 1
                ? 'grid-cols-1 max-w-md'
                : photos.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 aspect-square group cursor-pointer"
              >
                <img
                  src={photo}
                  alt={`Memory photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}