import type { ReactNode } from "react";
import { cn } from "@/shared/helpers/cn";

export type IconProps = {
  className?: string;
};

type HandIconProps = IconProps & {
  name: string;
  children: ReactNode;
};

export function HandIcon({ name, className, children }: HandIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-icon={name}
      className={cn("hand-icon size-4 shrink-0", className)}
    >
      {children}
    </svg>
  );
}
