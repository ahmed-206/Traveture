import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaArrowLeft } from "react-icons/fa6";
import { Button } from "../../../components/ui/Button";
import {
  useAdminTour,
  useCreateTour,
  useUpdateTour,
} from "../hooks/useAdminTours";
import { TourFormFields } from "../components/TourFormFields";
import type { TourFormValues } from "../types";
import { mapTourFormToPayload } from "../utils/mapTourFormToPayload";
import { mapTourToFormValues } from "../utils/mapTourToFormValues";

const AdminTourForm = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(tourId);

  const {
    data: existingTour,
    isPending: isLoadingTour,
    isError: isTourError,
  } = useAdminTour(tourId);

  const createMutation = useCreateTour();
  const updateMutation = useUpdateTour();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TourFormValues>();

  useEffect(() => {
    if (existingTour) {
      reset(mapTourToFormValues(existingTour));
    }
  }, [existingTour, reset]);

  const onSubmit = (data: TourFormValues) => {
    const payload = mapTourFormToPayload(data);

    if (isEditing && tourId) {
      updateMutation.mutate(
        { id: tourId, data: payload },
        { onSuccess: () => navigate("/admin/tours") },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => navigate("/admin/tours"),
    });
  };

  if (isEditing && isLoadingTour) {
    return (
      <div
        className="flex justify-center py-16"
        role="status"
        aria-label="Loading tour"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (isEditing && (isTourError || !existingTour)) {
    return (
      <div
        className="rounded-xl border border-error-light bg-error-light/40 p-5 text-sm text-error"
        role="alert"
      >
        Failed to load this tour. It may have been removed.
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            {isEditing ? "Edit Tour" : "Create Tour"}
          </h1>
          <p className="mt-1 text-sm text-body">
            {isEditing
              ? `Editing "${existingTour?.name ?? ""}"`
              : "Fill in the details to create a new tour"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          icon={<FaArrowLeft />}
          onClick={() => navigate("/admin/tours")}
        >
          Back to Tours
        </Button>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8"
      >
        <TourFormFields register={register} errors={errors} watch={watch} />

        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/tours")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            loadingText={isEditing ? "Updating..." : "Creating..."}
          >
            {isEditing ? "Update Tour" : "Create Tour"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminTourForm;
