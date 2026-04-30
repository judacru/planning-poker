/**
 * Game List Page
 * 
 * Displays all games the current user is participating in.
 * Allows creating new games, joining existing ones, and managing game ownership.
 */

import React, { useEffect } from 'react';
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
  const { gamesList, isLoading, error, getGames, deleteGame, setCurrentGame } = useGame();
  const socketService = useSocket();

  // Always reload games when this page mounts
  useEffect(() => {
    console.log('🎮 GameListPage mounted - reloading games');
    getGames();
    // Clear current game when viewing list
    setCurrentGame(undefined);
  }, []);

  useEffect(() => {
    const handleParticipantJoined = () => {
      getGames();
    };

    const handleParticipantLeft = () => {
      getGames();
    };

    socketService.onParticipantJoined(handleParticipantJoined);
    socketService.onParticipantLeft(handleParticipantLeft);

    return () => {
      socketService.offParticipantJoined(handleParticipantJoined);
      socketService.offParticipantLeft(handleParticipantLeft);
    };
  }, [getGames, socketService]);

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('Delete this game? All rounds and votes will be lost.')) {
      try {
        await deleteGame(gameId);
      } catch (err) {
        console.error('Error deleting game:', err);
      }
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

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                        onClick={() => handleDeleteGame(game.id)}
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
    </Container>
  );
};
