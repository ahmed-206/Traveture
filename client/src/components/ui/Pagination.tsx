import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disable the buttons while the next page is loading. */
  disabled?: boolean;
  /** Spacing/border around the bar, so it also fits inside a card footer. */
  className?: string;
}

const buttonClass =
  "inline-flex items-center gap-2 px-4 py-2 rounded-input border border-gray-300 bg-white font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = "pt-4",
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between gap-4 ${className}`}
    >
      <button
        type="button"
        className={buttonClass}
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <FaChevronLeft size={12} />
        Previous
      </button>

      <span className="text-small text-body">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className={buttonClass}
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <FaChevronRight size={12} />
      </button>
    </nav>
  );
};
