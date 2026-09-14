import { Box } from "@mui/material";
import EmptyState from "./EmptyState";

export default function ChatMessages() {
  return (
    <Box component="section" aria-label="Conversation" sx={{ flex: 1, display: "grid", placeItems: "center", minWidth: 0, p: { xs: 3, sm: 6 } }}>
      <EmptyState />
    </Box>
  );
}
