import './App.css';
import { Route, Routes } from 'react-router-dom';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import Dashboard from './pages/dashboard/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<div>홈</div>} />
    </Routes>
  );
}

export default App;
