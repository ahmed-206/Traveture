import { FaSpinner  } from "react-icons/fa6";

export const LoaderSpinner = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <FaSpinner  className="animate-spin text-primary" size={64} />
    </div>
  );
};
