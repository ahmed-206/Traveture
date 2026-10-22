import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminTours, useDeleteTour } from "../hooks/useAdminTours";
import { FaPlus, FaMapLocationDot } from "react-icons/fa6";
import type { Tour } from "../../tours/types";
import { ToursTable } from "../components/ToursTable";
import { DeleteTourModal } from "../components/DeleteTourModal";
import { Pagination } from "../../../components/ui/Pagination";

const PAGE_SIZE = 10;

const AdminToursList = () => {
  const navigate = useNavigate();

  // The current page lives in the URL (?page=2): refresh and the back button keep working.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1);

  const { data, isPending, isError, isPlaceholderData } = useAdminTours(
    page,
    PAGE_SIZE,
  );
  const tours = data?.tours ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (next: number) => setSearchParams({ page: String(next) });

  // Current page is past the last one (deleted the last row, or typed ?page=999)
  useEffect(() => {
    if (data && totalPages > 0 && page > totalPages) {
      setSearchParams({ page: String(totalPages) }, { replace: true });
    }
  }, [data, page, totalPages, setSearchParams]);

  const deleteMutation = useDeleteTour();
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null);

  const handleDelete = () => {
    if (!deleteTarget || deleteMutation.isPending) return;

    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Tours
          </h1>

          <p className="mt-1 text-sm text-body">
            Manage all your tours in one place
            {totalCount > 0 && ` (${totalCount} total)`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/tours/new")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          <FaPlus aria-hidden="true" />
          Add Tour
        </button>
      </header>

      {isPending && (
        <div
          className="flex justify-center py-16"
          role="status"
          aria-label="Loading tours"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      )}

      {/* Error State */}
      {!isPending && isError && (
        <div
          className="rounded-xl border border-error/50 bg-red-50 p-5 text-sm text-error"
          role="alert"
        >
          Failed to load tours. Please try again.
        </div>
      )}

      {!isPending && !isError && totalCount === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/50 text-2xl text-sky-600">
            <FaMapLocationDot aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-heading">
            No tours yet
          </h2>

          <p className="mt-1 text-sm text-body">
            Create your first tour to get started.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/tours/new")}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <FaPlus aria-hidden="true" />
            Add your first tour
          </button>
        </div>
      )}

      {!isPending && !isError && tours.length > 0 && (
        <div>
          <div className={isPlaceholderData ? "opacity-60 transition-opacity" : ""}>
            <ToursTable
              tours={tours}
              onEdit={(id) => navigate(`/admin/tours/${id}/edit`)}
              onDelete={setDeleteTarget}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            disabled={isPlaceholderData}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteTourModal
          tourName={deleteTarget.name}
          isDeleting={deleteMutation.isPending}
          errorMessage={
            deleteMutation.isError
              ? "Failed to delete the tour. Please try again."
              : undefined
          }
          onCancel={() => {
            if (!deleteMutation.isPending) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminToursList;
