import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserPhotos } from "./pages/UserPhotos";
import { ToastProvider } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/my-photos" element={<UserPhotos />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
