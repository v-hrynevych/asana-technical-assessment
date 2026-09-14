import { Box, Container, Paper } from "@mui/material";
import ChatHeader from "./ChatHeader";
import ChatConversation from "./ChatConversation";
import EmptyState from "./EmptyState";

export default function Chat() {
  return (
    <Box component="main" sx={{
      height: "100dvh", minHeight: 0, display: "flex", overflow: "hidden",
      bgcolor: "#f4f6fa", py: { xs: 2, sm: 4, md: 6 },
      "@media (max-height: 500px)": { py: 1 },
    }}>
      <Container maxWidth="md" sx={{ display: "flex", minHeight: 0 }}>
        <Paper
          variant="outlined"
          sx={{
            display: "flex", flexDirection: "column", flex: 1,
            minHeight: 0, minWidth: 0, borderRadius: 3, overflow: "hidden",
            "& > header, & > form": { flexShrink: 0 },
          }}
        >
          <ChatHeader />
          <ChatConversation emptyState={<EmptyState />} />
        </Paper>
      </Container>
    </Box>
  );
}
