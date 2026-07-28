import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-700 text-white shadow-sm active:scale-[0.98]",
  secondary:
    "bg-secondary hover:bg-secondary-dark text-white shadow-sm active:scale-[0.98]",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98]",
  ghost:
    "text-primary hover:bg-primary/10 active:scale-[0.98]",
  danger:
    "bg-error hover:bg-error-mid text-white shadow-sm active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-1.5 px-3 text-xs rounded-lg",
  md: "py-2.5 px-5 text-sm rounded-input",
  lg: "py-3 px-8 text-base rounded-input",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      icon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`font-semibold transition duration-200 cursor-pointer inline-flex items-center justify-center gap-2 ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${
          isDisabled ? "opacity-60 cursor-not-allowed" : ""
        } ${className}`}
        {...rest}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
