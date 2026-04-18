import { cn } from "@/lib/utils";
import { RiLoaderLine } from "@remixicon/react";
import { ComponentPropsWithoutRef } from "react";

type SpinnerProps = ComponentPropsWithoutRef<typeof RiLoaderLine>;

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <RiLoaderLine
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
