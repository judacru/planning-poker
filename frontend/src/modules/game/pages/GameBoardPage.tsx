/**
 * Game Board Page
 * 
 * Main game board interface displaying:
 * - Game header with round information
 * - Participants grid with voting status
 * - Voting cards selector
 * - Round management controls
 */

import React, { useEffect, useState } from 'react';
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
import { useSocket } from '../../../hooks/useSocket';
import { GameParticipant } from '../types';

export const GameBoardPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentGame, isLoading, error, getGame, leaveGame } = useGame();
  const socketService = useSocket();
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  useEffect(() => {
    if (gameId) {
      console.log('[UI] Loading game:', gameId);
      getGame(gameId).catch((err) => console.error('Failed to load game:', err));
    }
  }, [gameId, getGame]);

  // Join game room and listen for real-time updates
  useEffect(() => {
    if (!gameId) return;

    console.log('[UI] Joining game room:', gameId);
    socketService.joinGameRoom(gameId);

    // Setup listeners only once
    const handleParticipantJoined = (data: any) => {
      console.log('[UI] Participant joined event:', data);
      if (data.gameId === gameId) {
        console.log('[UI] Refreshing game after participant joined');
        getGame(gameId).catch((err: any) => {
          const status = err?.response?.status;
          if (status === 403 || status === 404) {
            navigate('/games');
            return;
          }
          console.error('[UI] Failed to refresh game after join:', err);
        });
      }
    };

    const handleParticipantLeft = (data: any) => {
      console.log('[UI] Participant left event:', data);
      if (data.userId === user?.id) {
        console.log('[UI] Ignoring self participant:left event');
        return;
      }
      if (data.gameId === gameId) {
        console.log('[UI] Refreshing game after participant left');
        getGame(gameId).catch((err: any) => {
          const status = err?.response?.status;
          if (status === 403 || status === 404) {
            navigate('/games');
            return;
          }
          console.error('[UI] Failed to refresh game after leave:', err);
        });
      }
    };

    const handleRoundCreated = (data: any) => {
      console.log('[UI] Round created event:', data);
      if (data.gameId === gameId) {
        setActiveRoundId(data.roundId);
        setSelectedVote(null);
      }
    };

    const handleVoteSubmitted = (data: any) => {
      console.log('[UI] Vote submitted event:', data);
    };

    const handleRoundRevealed = (data: any) => {
      console.log('[UI] Round revealed event:', data);
    };

    socketService.onParticipantJoined(handleParticipantJoined);
    socketService.onParticipantLeft(handleParticipantLeft);
    socketService.onRoundCreated(handleRoundCreated);
    socketService.onVoteSubmitted(handleVoteSubmitted);
    socketService.onVotesRevealed(handleRoundRevealed);

    // Cleanup on unmount
    return () => {
      console.log('[UI] Cleaning room listeners:', gameId);
      socketService.offParticipantJoined(handleParticipantJoined);
      socketService.offParticipantLeft(handleParticipantLeft);
      socketService.offRoundCreated(handleRoundCreated);
      socketService.offVoteSubmitted(handleVoteSubmitted);
      socketService.offVotesRevealed(handleRoundRevealed);
      socketService.leaveGameRoom();
    };
  }, [gameId, getGame, navigate, socketService, user?.id]);

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
          {!isHost && (
            <Button
              variant="outlined"
              color="error"
              onClick={async () => {
                try {
                  await leaveGame(gameId || '');
                  navigate('/games');
                } catch (err) {
                  console.error('Failed to leave game:', err);
                }
              }}
            >
              Leave Game
            </Button>
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
          {currentGame.participants && currentGame.participants.map((participant: GameParticipant) => (
            <Grid item xs={12} sm={6} md={3} key={participant.id}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: participant.userId === user?.id ? 'primary.light' : 'background.paper',
                  border: participant.userId === user?.id ? '2px solid' : '1px solid',
                  borderColor: participant.userId === user?.id ? 'primary.main' : 'divider',
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
                onClick={() => {
                  if (!gameId || !activeRoundId) {
                    console.log('[UI] Vote blocked: no active round');
                    return;
                  }

                  const numericValue = value === '>40' ? 41 : Number(value);
                  console.log(`[UI] Voting value=${value} numeric=${numericValue} round=${activeRoundId}`);
                  setSelectedVote(value);
                  socketService.submitVote(gameId, activeRoundId, numericValue);
                }}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: selectedVote === value ? 'primary.main' : 'background.paper',
                  border: '2px solid',
                  borderColor: selectedVote === value ? 'primary.main' : 'divider',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: selectedVote === value ? 'common.white' : 'text.primary',
                  }}
                >
                  {value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Round Controls */}
        {isHost && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => {
                if (!gameId) return;
                const ticketName = `Round ${new Date().toLocaleTimeString()}`;
                console.log('[UI] Creating round:', ticketName);
                socketService.createRound(gameId, ticketName);
              }}
            >
              New Round
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (!gameId || !activeRoundId) {
                  console.log('[UI] Reveal blocked: no active round');
                  return;
                }
                console.log('[UI] Revealing round:', activeRoundId);
                socketService.revealVotes(gameId, activeRoundId);
              }}
            >
              Reveal
            </Button>
          </Stack>
        )}
      </Box>
    </Container>
  );
};
