import { FaTrashCan } from "react-icons/fa6";

interface DeleteTourModalProps {
  tourName: string;
  isDeleting: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteTourModal = ({
  tourName,
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteTourModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-tour-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-lg text-error">
          <FaTrashCan aria-hidden="true" />
        </div>

        <h2
          id="delete-tour-title"
          className="mt-4 text-lg font-semibold text-heading"
        >
          Delete Tour
        </h2>

        <p className="mt-2 text-sm leading-6 text-body">
          Are you sure you want to delete{" "}
          <strong className="font-semibold text-heading">
            "{tourName}"
          </strong>
          ? This action cannot be undone.
        </p>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-body hover:bg-border/50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-error-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Tour"}
          </button>
        </div>
      </div>
    </div>
  );
};