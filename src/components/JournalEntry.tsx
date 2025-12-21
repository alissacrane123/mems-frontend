interface JournalEntryProps {
  id: string;
  content: string;
  date: string;
  time: string;
  location: string;
  photos?: string[];
  createdByName: string;
  isOwnPost: boolean;
}

export default function JournalEntry({
  id,
  content,
  date,
  time,
  location,
  photos = [],
  createdByName,
  isOwnPost
}: JournalEntryProps) {
  return (
    <div className={`flex ${isOwnPost ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isOwnPost ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Author Name */}
        <div className={`mb-1 px-1 ${isOwnPost ? 'text-right' : 'text-left'}`}>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {isOwnPost ? 'You' : createdByName}
          </span>
        </div>

        {/* Message Bubble */}
        <article
          className={`rounded-2xl shadow-sm p-4 transition-colors duration-200 ${
            isOwnPost
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
          }`}
        >
          {/* Content */}
          <div className={`leading-relaxed whitespace-pre-wrap mb-2 ${
            isOwnPost ? 'text-white' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {content}
          </div>

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="mt-3">
              <div
                className={`grid gap-2 ${
                  photos.length === 1
                    ? 'grid-cols-1 max-w-sm'
                    : photos.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
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

          {/* Metadata Footer */}
          <div className={`flex flex-wrap items-center gap-3 mt-3 pt-2 border-t ${
            isOwnPost
              ? 'border-blue-500'
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className={`flex items-center space-x-1 text-xs ${
              isOwnPost ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{date}</span>
            </div>
            <div className={`flex items-center space-x-1 text-xs ${
              isOwnPost ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{time}</span>
            </div>
            {location && (
              <div className={`flex items-center space-x-1 text-xs ${
                isOwnPost ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
