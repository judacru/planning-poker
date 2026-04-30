/**
 * Join Game Page
 * 
 * Allows users to join an existing game using an invite code.
 * Validates the code and navigates to the game board.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useGame } from '../../../hooks/useGame';

export const JoinGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { joinGame, isLoading, error, clearError } = useGame();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      const game = await joinGame({ inviteCode });
      navigate(`/games/${game.id}`);
    } catch (err) {
      console.error('Error joining game:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
              Join Game
            </Typography>

            <form onSubmit={handleJoinGame}>
              <Stack spacing={2}>
                {error && (
                  <Alert severity="error" onClose={clearError}>
                    {error}
                  </Alert>
                )}

                <TextField
                  label="Invite Code"
                  placeholder="Enter the invite code"
                  fullWidth
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  autoFocus
                  inputProps={{
                    maxLength: 6,
                    style: { textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'monospace' },
                  }}
                />

                <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
                  Ask your team host for the invite code.
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!inviteCode.trim() || isLoading}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Join Game'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/games')}
                  disabled={isLoading}
                >
                  Back to Games
                </Button>
              </Stack>
            </form>
          </CardContent>
    </Card>
      </Box>
    </Container>
  );
};
