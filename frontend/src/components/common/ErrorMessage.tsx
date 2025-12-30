import { ApiError } from '@/utils/api'

interface ErrorMessageProps {
  error: ApiError | Error | string | null
  title?: string
  onRetry?: () => void
  className?: string
}

const ErrorMessage = ({
  error,
  title = 'Something went wrong',
  onRetry,
  className = ''
}: ErrorMessageProps) => {
  if (!error) return null

  const errorMessage = typeof error === 'string'
    ? error
    : error instanceof ApiError
      ? error.message
      : error.message || 'An unexpected error occurred'

  const errorCode = error instanceof ApiError ? error.code : undefined

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-1">
            {title}
          </h3>
          <p className="text-red-700 mb-3">
            {errorMessage}
          </p>
          {errorCode && (
            <p className="text-sm text-red-600 mb-3">
              Error Code: {errorCode}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 active:bg-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
