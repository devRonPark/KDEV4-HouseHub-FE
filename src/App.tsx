import './App.css';
import { Route, Routes } from 'react-router-dom';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import Dashboard from './pages/dashboard/Dashboard';
import PropertyRegistration from './pages/property/PropertyRegistration';
import PropertyList from './pages/property/PropertyList';
import PropertyDetail from './pages/property/PropertyDetail';
import PropertyEdit from './pages/property/PropertyEdit';
import ContractList from './pages/contract/ContractList';
import ContractRegistration from './pages/contract/ContractRegistration';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/register"
        element={
          <ProtectedRoute>
            <PropertyRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <PropertyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <ProtectedRoute>
            <PropertyDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/edit/:id"
        element={
          <ProtectedRoute>
            <PropertyEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts"
        element={
          <ProtectedRoute>
            <ContractList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/register"
        element={
          <ProtectedRoute>
            <ContractRegistration />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<div>홈</div>} />
    </Routes>
  );
}

export default App;
