import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

/**
 * Custom render function that wraps components with required providers
 * Extend this when adding more providers (theme, auth, etc.)
 */
type CustomRenderOptions = Omit<RenderOptions, "wrapper">;

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Add providers here as needed
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Re-export everything from @testing-library/react
 */
export * from "@testing-library/react";
export { renderWithProviders as render };
