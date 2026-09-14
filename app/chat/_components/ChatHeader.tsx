import { Box, Typography } from "@mui/material";

export default function ChatHeader() {
  return (
    <Box component="header" sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="overline" color="text.secondary">AI Chat Challenge</Typography>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>Your conversation</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        A little space for your big questions.
      </Typography>
    </Box>
  );
}
