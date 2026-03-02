import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleCreateGame = () => {
    // TODO: Navigate to game creation flow
    console.log("Create new game");
  };

  const handleJoinGame = () => {
    // TODO: Navigate to game join flow
    console.log("Join existing game");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "40px 0",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          top: "-100px",
          right: "-100px",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
          bottom: "-50px",
          left: "-100px",
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={5}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-1px",
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                }}
              >
                ¡Bienvenido!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "1.1rem",
                  marginTop: 1,
                }}
              >
                Hola, {user?.firstName || user?.nickname || user?.email}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="error"
              onClick={logout}
              sx={{
                borderRadius: "10px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                },
              }}
            >
              Cerrar sesión
            </Button>
          </Box>

          {/* Hero Card */}
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: { xs: 3, sm: 4 },
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#1e3a8a",
                    marginBottom: 1,
                  }}
                >
                  ¿Qué deseas hacer?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inicia una nueva sesión de planning poker o únete a una existente.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleCreateGame}
                    sx={{
                      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                      borderRadius: "12px",
                      fontWeight: 700,
                      padding: "14px 24px",
                      transition: "all 0.3s ease",
                      fontSize: "1rem",
                      "&:hover": {
                        boxShadow: "0 10px 30px rgba(30, 58, 138, 0.3)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Crear sesión
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={handleJoinGame}
                    sx={{
                      borderColor: "#1e3a8a",
                      color: "#1e3a8a",
                      borderRadius: "12px",
                      fontWeight: 700,
                      padding: "14px 24px",
                      transition: "all 0.3s ease",
                      fontSize: "1rem",
                      "&:hover": {
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Unirse a sesión
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Card>

          {/* Info Cards Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "16px",
                  padding: 3,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                  height: "100%",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1e3a8a",
                    }}
                  >
                    📊 Planificación
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estima el esfuerzo de tus historias de usuario de forma colaborativa.
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "16px",
                  padding: 3,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                  height: "100%",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1e3a8a",
                    }}
                  >
                    👥 Equipo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invita a tus colegas e incluye múltiples participantes en las sesiones.
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "16px",
                  padding: 3,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1e3a8a",
                    }}
                  >
                    ⚡ En tiempo real
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Las votaciones se sincronizan instantáneamente entre todos los participantes.
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* Profile Summary */}
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: "16px",
              padding: 2.5,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#666" }}>
                Tu perfil
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Nickname
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.nickname}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
