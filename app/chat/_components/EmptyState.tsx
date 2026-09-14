import { Box, Typography } from "@mui/material";

export default function EmptyState() {
  return (
    <Box sx={{ maxWidth: 420, textAlign: "center", py: 4 }}>
      <Typography component="h2" variant="h5" sx={{ fontWeight: 600 }}>
        Start with a question
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Ask something you’re curious about, explore an idea, or find a fresh perspective.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This is a static preview. AI replies aren’t available yet.
      </Typography>
    </Box>
  );
}
