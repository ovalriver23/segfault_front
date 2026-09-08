import type { ReactNode } from "react";
import TableMenuShell from "./TableMenuShell";

export default function TableLayout({ children }: { children: ReactNode }) {
  return <TableMenuShell>{children}</TableMenuShell>;
}
