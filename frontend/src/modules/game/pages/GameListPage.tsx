/**
 * Game List Page
 * 
 * Displays all games the current user is participating in.
 * Allows creating new games, joining existing ones, and managing game ownership.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions as MuiDialogActions,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGame } from '../../../hooks/useGame';
import { useAuth } from '../../../hooks/useAuth';
import { useSocket } from '../../../hooks/useSocket';
import { GameResponse } from '../types';

export const GameListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gamesList, isLoading, error, getGames, deleteGame, clearError, setCurrentGame } = useGame();
  const socketService = useSocket();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getGames();
    setCurrentGame(undefined);
  }, []);

  useEffect(() => {
    const handleParticipantJoined = () => { getGames(); };
    const handleParticipantLeft = () => { getGames(); };

    socketService.onParticipantJoined(handleParticipantJoined);
    socketService.onParticipantLeft(handleParticipantLeft);

    return () => {
      socketService.offParticipantJoined(handleParticipantJoined);
      socketService.offParticipantLeft(handleParticipantLeft);
    };
  }, [getGames, socketService]);

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteGame(confirmDeleteId);
      setSuccessMessage('Game deleted successfully.');
    } catch {
      // error already set in context
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const isHost = (hostId: string) => hostId === user?.id;

  if (isLoading && gamesList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Games
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/games/create')}
            >
              Create Game
            </Button>
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/games/join')}
            >
              Join Game
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {gamesList.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                No games yet
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create a new game to get started with planning poker, or join an existing game.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/games/create')}
                >
                  Create Game
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/games/join')}
                >
                  Join Game
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {gamesList.map((game: GameResponse) => (
              <Grid item xs={12} sm={6} md={4} key={game.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" sx={{ flex: 1, wordBreak: 'break-word' }}>
                        {game.inviteCode}
                      </Typography>
                      {isHost(game.hostId) && (
                        <Chip label="Host" size="small" color="primary" variant="outlined" />
                      )}
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {game.participantCount} {game.participantCount === 1 ? 'participant' : 'participants'}
                    </Typography>

                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                      Created {new Date(game.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/games/${game.id}`)}
                    >
                      Enter Game
                    </Button>
                    {isHost(game.hostId) && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setConfirmDeleteId(game.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Game?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the game and all its rounds and votes. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <MuiDialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirmed}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </MuiDialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Container>
  );
};

