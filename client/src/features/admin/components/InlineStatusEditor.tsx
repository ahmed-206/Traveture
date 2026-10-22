import { useState } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";

type EditField = "status" | "paymentStatus";

export interface InlineEdit {
  bookingId: string;
  field: EditField;
  current: string;
}

export const InlineStatusEditor = ({
  edit,
  options,
  isPending,
  onSave,
  onClose,
}: {
  edit: InlineEdit;
  options: string[];
  isPending: boolean;
  onSave: (value: string) => void;
  onClose: () => void;
}) => {
  const [value, setValue] = useState(edit.current);

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium focus:outline-none focus:border-sky-500 capitalize cursor-pointer"
        aria-label={`Edit ${edit.field}`}
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
      <button
        type="button"
        title="Save"
        onClick={() => onSave(value)}
        disabled={isPending || value === edit.current}
        className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-40 cursor-pointer"
      >
        <FaCheck size={11} />
      </button>
      <button
        type="button"
        title="Cancel"
        onClick={onClose}
        disabled={isPending}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
      >
        <FaXmark size={11} />
      </button>
    </div>
  );
};
