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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ email, nickname, firstName, lastName, password });
      setMessage("Cuenta creada. Revisa tu correo para verificar el email.");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("No se pudo registrar la cuenta. Intenta de nuevo.");
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
              Únete a tu equipo
            </Typography>
          </Box>

          {/* Register Card */}
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
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
                  Crear cuenta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Regístrate para crear o unirte a una sesión de planning poker
                </Typography>
              </Box>

              <TextField
                label="Correo"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                placeholder="tu@email.com"
                variant="outlined"
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
                label="Nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                placeholder="tu nickname público"
                variant="outlined"
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

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Nombre"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  fullWidth
                  disabled={isSubmitting}
                  placeholder="Opcional"
                  variant="outlined"
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
                  label="Apellido"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  fullWidth
                  disabled={isSubmitting}
                  placeholder="Opcional"
                  variant="outlined"
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
              </Stack>

              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                variant="outlined"
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
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: "#3b82f6",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Inicia sesión
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage(null)}>
        <Alert onClose={() => setMessage(null)} severity="success" variant="filled">
          {message}
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(error)} autoHideDuration={3500} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
