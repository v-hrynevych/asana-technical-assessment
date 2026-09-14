import { Skeleton } from "@mui/material";

export default function LoadingMessage({ width = "76%", align = "left" }: { width?: string; align?: "left" | "right" }) {
  return (
    <Skeleton
      variant="rounded"
      animation="pulse"
      width={width}
      height={72}
      aria-hidden="true"
      sx={{
        bgcolor: "grey.200", borderRadius: 3, ml: align === "right" ? "auto" : 0,
        animationDuration: "2.5s",
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    />
  );
}
