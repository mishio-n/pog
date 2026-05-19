"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
};

export const Portal: React.FC<Props> = ({ children }) => {
  const portalElement = typeof document === "undefined" ? null : document.querySelector("#modal");

  return portalElement ? createPortal(<div>{children}</div>, portalElement) : null;
};
