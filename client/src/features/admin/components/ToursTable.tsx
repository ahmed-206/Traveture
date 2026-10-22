import { FaPen, FaTrashCan } from "react-icons/fa6";
import type { Tour } from "../../tours/types";
import { getTourImageUrl } from "../../../utils/getImageUrl";

interface ToursTableProps {
  tours: Tour[];
  onEdit: (tourId: string) => void;
  onDelete: (tour: Tour) => void;
}

export const ToursTable = ({
  tours,
  onEdit,
  onDelete,
}: ToursTableProps) => {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-heading">
          All Tours ({tours.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-212.5 divide-y divide-border text-left text-sm">
          <thead className="bg-border/50">
            <tr>
              {[
                "Tour",
                "Difficulty",
                "Duration",
                "Price",
                "Rating",
                "Group Size",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-5 py-3 font-semibold text-body"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {tours.map((tour) => (
              <tr key={tour._id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getTourImageUrl(tour.imageCover)}
                      alt=""
                      loading="lazy"
                      className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    />

                    <span className="font-medium text-heading">
                      {tour.name}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex  px-2.5 py-1 text-xs font-bold ${
                      tour.difficulty === "easy"
                        ? " text-success"
                        : tour.difficulty === "medium"
                          ? " text-secondary"
                          : " text-error-dark"
                    }`}
                  >
                    {tour.difficulty}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-body">
                  {tour.duration} days
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-medium text-heading">
                  ${tour.price}
                </td>

                <td className="whitespace-nowrap font-bold  px-5 py-4 text-secondary">
                   {tour.ratingsAverage}
                </td>

                <td className="px-5 py-4 text-body">
                  {tour.maxGroupSize}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Edit ${tour.name}`}
                      onClick={() => onEdit(tour._id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-body hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <FaPen aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${tour.name}`}
                      onClick={() => onDelete(tour)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-body hover:bg-error/10 hover:text-error focus-visible:outline-2 focus-visible:outline-error"
                    >
                      <FaTrashCan aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};