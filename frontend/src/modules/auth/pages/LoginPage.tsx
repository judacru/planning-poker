import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate("/dashboard");
    } catch {
      setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        position: "relative",
        overflow: "hidden",
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
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4} alignItems="center">
          {/* Header */}
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "white",
                marginBottom: 1,
                letterSpacing: "-1px",
                fontSize: { xs: "2.5rem", sm: "3rem" },
              }}
            >
              Poker
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              Estima con tu equipo en tiempo real
            </Typography>
          </Box>

          {/* Login Card */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              background: "white",
              borderRadius: "20px",
              padding: { xs: 3, sm: 4 },
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
              width: "100%",
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
                  Bienvenido de vuelta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingresa con tu correo o nickname
                </Typography>
              </Box>

              <TextField
                label="Correo o nickname"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                placeholder="tu@email.com o nickname"
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "&:hover fieldset": {
                      borderColor: "#3b82f6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1e3a8a",
                      borderWidth: "2px",
                    },
                  },
                }}
              />

              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "&:hover fieldset": {
                      borderColor: "#3b82f6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1e3a8a",
                      borderWidth: "2px",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  padding: "12px 24px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 10px 30px rgba(30, 58, 138, 0.3)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                  },
                }}
                startIcon={isSubmitting ? <CircularProgress color="inherit" size={18} /> : null}
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes cuenta?{" "}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: "#3b82f6",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Regístrate aquí
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Snackbar open={Boolean(error)} autoHideDuration={3500} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
