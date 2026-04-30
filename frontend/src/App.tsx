import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./modules/auth/pages/LoginPage";
import RegisterPage from "./modules/auth/pages/RegisterPage";
import DashboardPage from "./modules/dashboard/pages/DashboardPage";
import {
  GameListPage,
  CreateGamePage,
  JoinGamePage,
  GameBoardPage,
} from "./modules/game";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useSocket } from "./hooks/useSocket";

function PublicIndexRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  useSocket();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicIndexRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <GameListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/create"
          element={
            <ProtectedRoute>
              <CreateGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/join"
          element={
            <ProtectedRoute>
              <JoinGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:gameId"
          element={
            <ProtectedRoute>
              <GameBoardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
