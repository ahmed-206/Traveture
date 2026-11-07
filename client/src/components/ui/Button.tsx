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
  fullWidthOnMobile?: boolean;
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
  sm: "py-1.5 px-3 text-xs rounded-lg min-h-[36px]",
  md: "py-2 sm:py-2.5 px-3.5 sm:px-5 text-xs sm:text-sm rounded-input min-h-[40px] sm:min-h-[44px]",
  lg: "py-2.5 sm:py-3 px-5 sm:px-8 text-sm sm:text-base rounded-input min-h-[44px] sm:min-h-[48px]",
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
      fullWidthOnMobile = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const widthClass = fullWidth
      ? "w-full"
      : fullWidthOnMobile
      ? "w-full sm:w-auto"
      : "";

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`font-semibold transition duration-200 cursor-pointer inline-flex items-center justify-center gap-2 select-none touch-manipulation ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${widthClass} ${
          isDisabled ? "opacity-60 cursor-not-allowed" : ""
        } ${className}`}
        {...rest}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0"
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
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0 flex items-center">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
