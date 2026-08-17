import * as Lucide from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName = keyof typeof Lucide;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}

/** Componente unico de iconografia. No importar lucide-react directamente en vistas. */
export const Icon = ({ name, className, size = 16, strokeWidth = 1.5, ...rest }: IconProps) => {
  const Cmp = Lucide[name] as React.ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
  }>;
  if (!Cmp) return null;
  return (
    <Cmp
      className={cn("shrink-0", className)}
      size={size}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
};

export default Icon;
