/**
 * Round History Panel
 *
 * Displays the list of revealed rounds with vote breakdown and average.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import gameService from '../service';
import { RoundHistory } from '../types';

interface RoundHistoryPanelProps {
  gameId: string;
  /** Pass a number that increments each time a new round is revealed to trigger a refresh */
  refreshKey?: number;
}

export const RoundHistoryPanel: React.FC<RoundHistoryPanelProps> = ({ gameId, refreshKey }) => {
  const [rounds, setRounds] = useState<RoundHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gameService.getRoundHistory(gameId);
      setRounds(data);
    } catch (err) {
      setError('Could not load round history.');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  if (isLoading && rounds.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (rounds.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}
      >
        <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary" variant="body2">
          No rounds revealed yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {rounds.map((round) => (
        <Accordion key={round.id} disableGutters elevation={0} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 1 }}>
              <Chip
                label={`#${round.ticketNumber}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontFamily: 'monospace', minWidth: 36 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
                {round.ticketName || 'Unnamed round'}
              </Typography>
              {round.average !== null && (
                <Chip
                  label={`avg ${round.average}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Grid container spacing={1}>
              {round.votes.map((vote) => (
                <Grid item xs={6} sm={4} md={3} key={vote.userId}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: 12 }}>
                      {vote.nickname}
                    </Typography>
                    <Chip
                      label={vote.value === null ? '–' : vote.value === 41 ? '>40' : vote.value}
                      size="small"
                      sx={{ fontFamily: 'monospace', fontWeight: 'bold', minWidth: 36 }}
                    />
                  </Paper>
                </Grid>
              ))}
              {round.votes.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    No votes recorded
                  </Typography>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
