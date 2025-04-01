import './App.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignUp from './pages/auth/SignUp';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<div>홈</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
