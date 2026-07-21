
interface Props {
    message?: string;
    onRetry?: () => void;
  }
  
  export const TourErrorState = ({ message = "Something went wrong!", onRetry }: Props) => {
    return (
      <div className="my-12 flex flex-col items-center justify-center rounded-xl bg-red-50 p-8 text-center border border-error-light">
        <h3 className="text-xl font-bold text-error-mid">Failed to load tours</h3>
        <p className="mt-2 text-error">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg bg-error-mid px-5 py-2 font-semibold text-white transition hover:bg-error-dark"
          >
            Try Again
          </button>
        )}
      </div>
    );
  };