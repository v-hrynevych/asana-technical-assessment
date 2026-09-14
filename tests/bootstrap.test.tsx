import { render, screen } from "@testing-library/react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Typography from "@mui/material/Typography";
import { expect, it } from "vitest";

it("renders Material UI through the App Router cache provider", () => {
  render(
    <AppRouterCacheProvider>
      <Typography component="h1">Bootstrap ready</Typography>
    </AppRouterCacheProvider>,
  );

  expect(screen.getByRole("heading", { name: "Bootstrap ready" })).toBeVisible();
});
