import { useState, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type, className = "", id, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-body mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body/50 pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={resolvedType}
            className={`w-full px-4 py-2.5 rounded-input border border-body/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition text-heading text-sm ${
              icon ? "pl-10" : ""
            } ${error ? "border-error focus:ring-error/30" : ""} ${className}`}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-body/50 hover:text-body focus:outline-none p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FaRegEyeSlash size={20} />
              ) : (
                <FaRegEye size={20} />
              )}
            </button>
          )}
        </div>

        {error && <p className="text-error text-xs mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
