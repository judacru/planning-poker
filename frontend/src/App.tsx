import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "@mui/material";

function App() {
  return (
    <Router>
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<div>Home Page Coming Soon</div>} />
          <Route path="/login" element={<div>Login Page Coming Soon</div>} />
          <Route path="/register" element={<div>Register Page Coming Soon</div>} />
          <Route path="/game/:gameId" element={<div>Game Page Coming Soon</div>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
