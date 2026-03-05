/**
 * Game Board Page
 * 
 * Main game board interface displaying:
 * - Game header with round information
 * - Participants grid with voting status
 * - Voting cards selector
 * - Round management controls
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGame } from '../../../hooks/useGame';
import { useAuth } from '../../../hooks/useAuth';
import { GameParticipant } from '../types';

export const GameBoardPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentGame, isLoading, error, getGame } = useGame();

  useEffect(() => {
    if (gameId) {
      getGame(gameId);
    }
  }, [gameId]);

  if (!gameId) {
    return (
      <Container>
        <Alert severity="error">Game ID not found</Alert>
      </Container>
    );
  }

  if (isLoading && !currentGame) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentGame) {
    return (
      <Container>
        <Stack spacing={2} sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error">Game not found</Alert>
          <Button variant="contained" onClick={() => navigate('/games')}>
            Back to Games
          </Button>
        </Stack>
      </Container>
    );
  }

  const isHost = currentGame.hostId === user?.id;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/games')}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1 }}>
            Game Board
          </Typography>
          {isHost && (
            <Chip label="Host" color="primary" variant="outlined" />
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Game Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Invite Code
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {currentGame.inviteCode}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography color="textSecondary" variant="body2">
                  Participants: {currentGame.participants.length}
                </Typography>
                <Stack direction="row" spacing={0} sx={{ ml: 'auto' }}>
                  {currentGame.participants.map((participant: GameParticipant) => (
                    <Tooltip key={participant.id} title={participant.nickname}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {participant.nickname.slice(0, 2).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Participants Grid */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Participants
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {currentGame.participants.map((participant: GameParticipant) => (
            <Grid item xs={12} sm={6} md={3} key={participant.id}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: participant.id === user?.id ? 'primary.light' : 'background.paper',
                  border: participant.id === user?.id ? '2px solid' : '1px solid',
                  borderColor: participant.id === user?.id ? 'primary.main' : 'divider',
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 1,
                    fontSize: 16,
                  }}
                >
                  {participant.nickname.slice(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {participant.nickname}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    p: 1,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                  }}
                >
                  ?
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Voting Cards */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Your Vote
        </Typography>
        <Grid container spacing={1} sx={{ mb: 4 }}>
          {['0.5', '1', '2', '3', '5', '8', '13', '21', '40', '>40'].map((value) => (
            <Grid item xs={6} sm={4} md={2} key={value}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Round Controls */}
        {isHost && (
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<RefreshIcon />}>
              New Round
            </Button>
            <Button variant="outlined">
              Reveal
            </Button>
          </Stack>
        )}
      </Box>
    </Container>
  );
};
