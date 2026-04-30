/**
 * Game Board Page
 *
 * Main game board interface displaying:
 * - Game header with round information
 * - Participants grid with real-time voting status
 * - Voting cards selector
 * - Round management controls (host only)
 */

import React, { useEffect, useState, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useGame } from '../../../hooks/useGame';
import { useAuth } from '../../../hooks/useAuth';
import { useSocket } from '../../../hooks/useSocket';
import {
  GameParticipant,
  VoteResult,
  RoundCreatedPayload,
  VoteSubmittedPayload,
  RoundRevealedPayload,
} from '../types';

const VOTE_OPTIONS = ['0.5', '1', '2', '3', '5', '8', '13', '21', '40', '>40'];

export const GameBoardPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentGame, isLoading, error, getGame, leaveGame } = useGame();
  const socketService = useSocket();

  // Round state
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [activeRoundName, setActiveRoundName] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState(false);

  // Vote state
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [votedUserIds, setVotedUserIds] = useState<Set<string>>(new Set());
  const [revealedVotes, setRevealedVotes] = useState<Map<string, number | null>>(new Map());
  const [voteAverage, setVoteAverage] = useState<number | null>(null);

  // New round dialog
  const [newRoundDialogOpen, setNewRoundDialogOpen] = useState(false);
  const [newRoundTicketName, setNewRoundTicketName] = useState('');

  // Initialize from current game's latest round
  useEffect(() => {
    const round = currentGame?.currentRound;
    if (!round) return;

    setActiveRoundId(round.id);
    setActiveRoundName(round.ticketName || '');

    if (round.state === 'REVEALED') {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
      setVotedUserIds(new Set());
      setRevealedVotes(new Map());
      setVoteAverage(null);
    }
  }, [currentGame?.currentRound?.id]);

  const resetRoundState = useCallback(() => {
    setSelectedVote(null);
    setVotedUserIds(new Set());
    setRevealedVotes(new Map());
    setVoteAverage(null);
    setIsRevealed(false);
  }, []);

  // Load game on mount
  useEffect(() => {
    if (gameId) {
      getGame(gameId).catch((err) => console.error('Failed to load game:', err));
    }
  }, [gameId, getGame]);

  // WebSocket room + listeners
  useEffect(() => {
    if (!gameId) return;

    socketService.joinGameRoom(gameId);

    const handleParticipantJoined = (data: any) => {
      if (data.gameId === gameId) {
        getGame(gameId).catch((err: any) => {
          if (err?.response?.status === 403 || err?.response?.status === 404) navigate('/games');
        });
      }
    };

    const handleParticipantLeft = (data: any) => {
      if (data.userId === user?.id) return;
      if (data.gameId === gameId) {
        getGame(gameId).catch((err: any) => {
          if (err?.response?.status === 403 || err?.response?.status === 404) navigate('/games');
        });
      }
    };

    const handleRoundCreated = (data: RoundCreatedPayload) => {
      if (data.gameId === gameId) {
        setActiveRoundId(data.roundId);
        setActiveRoundName(data.ticketName);
        resetRoundState();
      }
    };

    const handleVoteSubmitted = (data: VoteSubmittedPayload) => {
      if (data.gameId === gameId && data.roundId === activeRoundId) {
        setVotedUserIds((prev) => new Set([...prev, data.userId]));
      }
    };

    const handleRoundRevealed = (data: RoundRevealedPayload) => {
      if (data.gameId === gameId) {
        const votesMap = new Map<string, number | null>();
        data.votes.forEach((v: VoteResult) => votesMap.set(v.userId, v.value));
        setRevealedVotes(votesMap);
        setVoteAverage(data.average);
        setIsRevealed(true);
      }
    };

    const handleGameDeleted = (data: any) => {
      if (data.gameId === gameId) navigate('/games');
    };

    socketService.onParticipantJoined(handleParticipantJoined);
    socketService.onParticipantLeft(handleParticipantLeft);
    socketService.onRoundCreated(handleRoundCreated);
    socketService.onVoteSubmitted(handleVoteSubmitted);
    socketService.onVotesRevealed(handleRoundRevealed);
    socketService.getSocket()?.on('game:deleted', handleGameDeleted);

    return () => {
      socketService.offParticipantJoined(handleParticipantJoined);
      socketService.offParticipantLeft(handleParticipantLeft);
      socketService.offRoundCreated(handleRoundCreated);
      socketService.offVoteSubmitted(handleVoteSubmitted);
      socketService.offVotesRevealed(handleRoundRevealed);
      socketService.getSocket()?.off('game:deleted', handleGameDeleted);
      socketService.leaveGameRoom();
    };
  }, [gameId, getGame, navigate, socketService, user?.id, activeRoundId, resetRoundState]);

  if (!gameId) {
    return (
      <Container>
        <Alert severity="error">Game ID not found</Alert>
      </Container>
    );
  }

  if (isLoading && !currentGame) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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

  const handleVote = (value: string) => {
    if (!activeRoundId || isRevealed) return;
    const numericValue = value === '>40' ? 41 : Number(value);
    setSelectedVote(value);
    socketService.submitVote(gameId, activeRoundId, numericValue);
  };

  const handleCreateRound = () => {
    if (!newRoundTicketName.trim()) return;
    socketService.createRound(gameId, newRoundTicketName.trim());
    setNewRoundTicketName('');
    setNewRoundDialogOpen(false);
  };

  const handleReveal = () => {
    if (!activeRoundId) return;
    socketService.revealVotes(gameId, activeRoundId);
  };

  const getParticipantVoteDisplay = (participant: GameParticipant) => {
    const uid = participant.userId || '';
    if (isRevealed) {
      const val = revealedVotes.get(uid);
      if (val === undefined) return '–';
      return val === null ? '–' : val === 41 ? '>40' : String(val);
    }
    return votedUserIds.has(uid) ? '✓' : '?';
  };

  const hasVoted = (participant: GameParticipant) =>
    votedUserIds.has(participant.userId || '');

  const isCurrentUser = (participant: GameParticipant) =>
    participant.userId === user?.id;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/games')}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {currentGame.name || 'Planning Poker'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invite code:{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {currentGame.inviteCode}
              </Box>
            </Typography>
          </Box>
          {isHost ? (
            <Chip label="Host" color="primary" />
          ) : (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={async () => {
                try {
                  await leaveGame(gameId);
                  navigate('/games');
                } catch {
                  // error displayed via context
                }
              }}
            >
              Leave
            </Button>
          )}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Active Round Banner */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            bgcolor: activeRoundId ? 'primary.50' : 'action.hover',
            borderColor: activeRoundId ? 'primary.main' : 'divider',
          }}
        >
          <CardContent sx={{ py: '12px !important' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1 }}>
                {activeRoundId ? (
                  <>
                    <Typography variant="overline" color="primary" sx={{ lineHeight: 1 }}>
                      Current Round
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {activeRoundName || 'Unnamed Round'}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {isHost
                      ? 'No active round — start one to begin voting.'
                      : 'Waiting for host to start a round…'}
                  </Typography>
                )}
              </Box>
              {activeRoundId && (
                <Chip
                  label={isRevealed ? 'Revealed' : `${votedUserIds.size} voted`}
                  color={isRevealed ? 'success' : 'default'}
                  size="small"
                />
              )}
              {isHost && (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setNewRoundDialogOpen(true)}
                  >
                    New Round
                  </Button>
                  {activeRoundId && !isRevealed && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={handleReveal}
                    >
                      Reveal
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Vote Average (after reveal) */}
        {isRevealed && voteAverage !== null && (
          <Card sx={{ mb: 3, bgcolor: 'success.50', borderColor: 'success.main' }} variant="outlined">
            <CardContent sx={{ py: '12px !important' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="overline" color="success.main" sx={{ lineHeight: 1 }}>
                    Average
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                    {voteAverage}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {currentGame.participants.map((p: GameParticipant) => {
                    const uid = p.userId || '';
                    const val = revealedVotes.get(uid);
                    return (
                      <Chip
                        key={p.id}
                        label={`${p.nickname}: ${val === undefined || val === null ? '–' : val === 41 ? '>40' : val}`}
                        size="small"
                        variant="outlined"
                      />
                    );
                  })}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Participants Grid */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Participants ({currentGame.participants.length})
        </Typography>
        {currentGame.participants.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
            <Typography color="text.secondary">No players yet</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {currentGame.participants.map((participant: GameParticipant) => {
              const voted = hasVoted(participant);
              const current = isCurrentUser(participant);
              const voteDisplay = getParticipantVoteDisplay(participant);
              const revealed = isRevealed;

              return (
                <Grid item xs={6} sm={4} md={3} key={participant.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'border-color 0.2s',
                      borderColor: current ? 'primary.main' : voted ? 'success.main' : 'divider',
                      borderWidth: current ? 2 : 1,
                    }}
                  >
                    {current && (
                      <Chip
                        label="You"
                        size="small"
                        color="primary"
                        sx={{ position: 'absolute', top: 8, right: 8, fontSize: 10, height: 18 }}
                      />
                    )}
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        voted && !revealed ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: current ? 'primary.main' : 'grey.400',
                          mx: 'auto',
                          mb: 1,
                          fontSize: 16,
                        }}
                      >
                        {participant.nickname.slice(0, 2).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Typography
                      noWrap
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {participant.nickname}
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        py: 0.75,
                        px: 1,
                        bgcolor: revealed
                          ? voteDisplay === '–'
                            ? 'action.hover'
                            : 'primary.main'
                          : voted
                          ? 'success.50'
                          : 'action.hover',
                        borderColor: revealed && voteDisplay !== '–' ? 'primary.main' : 'divider',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          color: revealed && voteDisplay !== '–' ? 'common.white' : 'text.secondary',
                        }}
                      >
                        {voteDisplay}
                      </Typography>
                    </Paper>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Voting Cards */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Your Vote
          {!activeRoundId && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (waiting for round)
            </Typography>
          )}
          {isRevealed && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (round revealed)
            </Typography>
          )}
        </Typography>
        <Grid container spacing={1} sx={{ mb: 4 }}>
          {VOTE_OPTIONS.map((value) => {
            const isSelected = selectedVote === value;
            const disabled = !activeRoundId || isRevealed;
            return (
              <Grid item xs={4} sm={3} md={2} key={value}>
                <Paper
                  onClick={() => !disabled && handleVote(value)}
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.15s',
                    bgcolor: isSelected ? 'primary.main' : 'background.paper',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderWidth: isSelected ? 2 : 1,
                    '&:hover': !disabled
                      ? {
                          bgcolor: isSelected ? 'primary.dark' : 'primary.50',
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        }
                      : {},
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      color: isSelected ? 'common.white' : 'text.primary',
                    }}
                  >
                    {value}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* New Round Dialog */}
      <Dialog
        open={newRoundDialogOpen}
        onClose={() => setNewRoundDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>New Round</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Ticket / Story name"
            placeholder="e.g. USER-123 Add login"
            value={newRoundTicketName}
            onChange={(e) => setNewRoundTicketName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRound()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRoundDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateRound}
            disabled={!newRoundTicketName.trim()}
          >
            Start Round
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
