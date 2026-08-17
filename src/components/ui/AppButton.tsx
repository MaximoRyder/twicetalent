import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import Icon, { IconName } from "@/components/ui/Icon";

type Variant = "primary" | "secondary" | "ghost";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "tt-btn-primary",
  secondary: "tt-btn-secondary",
  ghost:
    "inline-flex items-center justify-center px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground hover:text-foreground transition-colors font-['Space_Grotesk']",
};

/** Boton unico de la app. No usar <button> crudo en vistas nuevas. */
export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    { variant = "primary", loading, iconLeft, iconRight, fullWidth, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        variants[variant],
        "gap-2 disabled:opacity-40 disabled:pointer-events-none",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Icon name="Loader2" className="animate-spin" size={15} />
      ) : (
        iconLeft && <Icon name={iconLeft} size={15} />
      )}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={15} />}
    </button>
  )
);
AppButton.displayName = "AppButton";

export default AppButton;
