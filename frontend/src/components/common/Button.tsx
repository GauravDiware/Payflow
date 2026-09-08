import type { ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger";

const classes: Record<Variant, string> = {
  primary: "primary-button",
  secondary: "secondary-button",
  danger: "danger-button",
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  onClick,
  disabled,
  loading,
  type = "button",
  fullWidth,
  icon,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${classes[variant]} ${fullWidth ? "wide" : ""}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 size={16} className="spin" /> : icon}
      {loading ? "Processing..." : children}
    </button>
  );
}

export function TextLink({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button className="text-button" onClick={onClick}>
      {children}
      {icon ?? <ArrowRight size={15} />}
    </button>
  );
}
