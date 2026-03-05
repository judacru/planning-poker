/**
 * Create Game Page
 * 
 * Allows users to create a new planning poker game.
 * Displays the generated invite code for sharing with others.
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useGame } from '../../../hooks/useGame';

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { createGame, isLoading, error, clearError } = useGame();
  const [ticketName, setTicketName] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName.trim()) return;

    try {
      const game = await createGame({ ticketName });
      setInviteCode(game.inviteCode);
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToGame = () => {
    navigate('/games');
  };

  if (inviteCode) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                ✓ Game Created!
              </Typography>

              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Invite Code
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      mb: 2,
                      wordBreak: 'break-all',
                    }}
                  >
                    {inviteCode}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyInviteCode}
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                  Share this code with your team to join the game.
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGoToGame}
                  sx={{ mt: 2 }}
                >
                  Go to Game
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
              Create New Game
            </Typography>

            <form onSubmit={handleCreateGame}>
              <Stack spacing={2}>
                {error && (
                  <Alert severity="error" onClose={clearError}>
                    {error}
                  </Alert>
                )}

                <TextField
                  label="Ticket/Story Name"
                  placeholder="e.g., User Authentication"
                  fullWidth
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!ticketName.trim() || isLoading}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Create Game'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
