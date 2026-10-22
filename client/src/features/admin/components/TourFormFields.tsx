import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { Input } from "../../../components/ui/Input";
import type { TourFormValues } from "../types";

const controlClass =
  "w-full px-4 py-2.5 rounded-input border border-body/50 bg-white text-heading text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent";

const labelClass = "block text-sm font-semibold text-body mb-1";

interface TourFormFieldsProps {
  register: UseFormRegister<TourFormValues>;
  errors: FieldErrors<TourFormValues>;
  watch: UseFormWatch<TourFormValues>;
}

export const TourFormFields = ({
  register,
  errors,
  watch,
}: TourFormFieldsProps) => {
  const price = watch("price");

  return (
    <>
      <fieldset className="space-y-4">
        <legend className="w-full border-b border-border pb-2 text-base font-semibold text-heading">
          Basic Information
        </legend>

        <Input
          id="name"
          label="Tour Name *"
          placeholder="e.g. The Forest Hiker"
          error={errors.name?.message}
          {...register("name", {
            required: "Tour name is required",
            minLength: {
              value: 10,
              message: "Name must be at least 10 characters",
            },
            maxLength: {
              value: 40,
              message: "Name must be less than 40 characters",
            },
          })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="duration"
            type="number"
            label="Duration (days) *"
            placeholder="7"
            error={errors.duration?.message}
            {...register("duration", {
              required: "Duration is required",
              valueAsNumber: true,
              min: { value: 1, message: "Must be at least 1 day" },
            })}
          />

          <Input
            id="maxGroupSize"
            type="number"
            label="Max Group Size *"
            placeholder="25"
            error={errors.maxGroupSize?.message}
            {...register("maxGroupSize", {
              required: "Group size is required",
              valueAsNumber: true,
              min: { value: 1, message: "Must be at least 1" },
            })}
          />

          <div>
            <label htmlFor="difficulty" className={labelClass}>
              Difficulty *
            </label>
            <select
              id="difficulty"
              className={`${controlClass} ${
                errors.difficulty ? "border-error focus:ring-error/30" : ""
              }`}
              {...register("difficulty", {
                required: "Difficulty is required",
              })}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="difficult">Difficult</option>
            </select>
            {errors.difficulty && (
              <p className="mt-0.5 text-xs text-error">
                {errors.difficulty.message}
              </p>
            )}
          </div>

          <Input
            id="price"
            type="number"
            label="Price ($) *"
            placeholder="997"
            error={errors.price?.message}
            {...register("price", {
              required: "Price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Price cannot be negative" },
            })}
          />

          <Input
            id="priceDiscount"
            type="number"
            label="Price Discount ($)"
            placeholder="0"
            error={errors.priceDiscount?.message}
            {...register("priceDiscount", {
              valueAsNumber: true,
              min: { value: 0, message: "Discount cannot be negative" },
              validate: (value) => {
                if (value === undefined || Number.isNaN(value)) return true;
                if (!Number.isFinite(price)) return true;
                return value < price || "Discount must be less than the price";
              },
            })}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="w-full border-b border-border pb-2 text-base font-semibold text-heading">
          Description
        </legend>

        <div>
          <label htmlFor="summary" className={labelClass}>
            Summary *
          </label>
          <textarea
            id="summary"
            rows={3}
            placeholder="Brief summary of the tour..."
            className={`${controlClass} min-h-24 resize-y ${
              errors.summary ? "border-error focus:ring-error/30" : ""
            }`}
            {...register("summary", { required: "Summary is required" })}
          />
          {errors.summary && (
            <p className="mt-0.5 text-xs text-error">{errors.summary.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Full Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Detailed description of the tour..."
            className={`${controlClass} min-h-28 resize-y`}
            {...register("description")}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="w-full border-b border-border pb-2 text-base font-semibold text-heading">
          Images
        </legend>

        <Input
          id="imageCover"
          label="Cover Image URL *"
          placeholder="https://example.com/cover.jpg"
          error={errors.imageCover?.message}
          {...register("imageCover", {
            required: "Cover image is required",
          })}
        />

        <Input
          id="images"
          label="Additional Images (comma-separated URLs)"
          placeholder="url1, url2, url3"
          {...register("images")}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="w-full border-b border-border pb-2 text-base font-semibold text-heading">
          Dates
        </legend>

        <Input
          id="startDates"
          label="Start Dates (comma-separated ISO dates)"
          placeholder="2027-03-15, 2027-06-20, 2027-09-10"
          {...register("startDates")}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="w-full border-b border-border pb-2 text-base font-semibold text-heading">
          Start Location
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="startLocationLng"
            type="number"
            step="any"
            label="Longitude"
            placeholder="-80.185942"
            error={errors.startLocationLng?.message}
            {...register("startLocationLng", {
              valueAsNumber: true,
              validate: (value, values) => {
                const hasLng = Number.isFinite(value);
                const hasLat = Number.isFinite(values.startLocationLat);
                if (hasLng !== hasLat) {
                  return "Both longitude and latitude are required";
                }
                if (typeof value === "number" && (value < -180 || value > 180)) {
                  return "Longitude must be between -180 and 180";
                }
                return true;
              },
            })}
          />

          <Input
            id="startLocationLat"
            type="number"
            step="any"
            label="Latitude"
            placeholder="25.774772"
            error={errors.startLocationLat?.message}
            {...register("startLocationLat", {
              valueAsNumber: true,
              validate: (value, values) => {
                const hasLat = Number.isFinite(value);
                const hasLng = Number.isFinite(values.startLocationLng);
                if (hasLat !== hasLng) {
                  return "Both longitude and latitude are required";
                }
                if (typeof value === "number" && (value < -90 || value > 90)) {
                  return "Latitude must be between -90 and 90";
                }
                return true;
              },
            })}
          />

          <Input
            id="startLocationAddress"
            label="Address"
            placeholder="Cairo, Egypt"
            {...register("startLocationAddress")}
          />

          <Input
            id="startLocationDescription"
            label="Location Description"
            placeholder="Cairo, Egypt"
            {...register("startLocationDescription")}
          />
        </div>
      </fieldset>
    </>
  );
};
