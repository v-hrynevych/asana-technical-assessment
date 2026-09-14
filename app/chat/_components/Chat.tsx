import { Box, Container, Paper } from "@mui/material";
import ChatHeader from "./ChatHeader";
import ChatConversation from "./ChatConversation";
import EmptyState from "./EmptyState";

export default function Chat() {
  return (
    <Box component="main" sx={{ minHeight: "100dvh", bgcolor: "#f4f6fa", py: { xs: 2, sm: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Paper
          variant="outlined"
          sx={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 96px)", borderRadius: 3, overflow: "hidden" }}
        >
          <ChatHeader />
          <ChatConversation emptyState={<EmptyState />} />
        </Paper>
      </Container>
    </Box>
  );
}
