import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import AvailableDrives from "./pages/student/AvailableDrivers";
import MyApplications from "./pages/student/MyApplication";

import Companies from "./pages/admin/Companies";
import Applications from "./pages/admin/Applications";
import Students from "./pages/admin/Students";
import EligibleStudents from "./pages/admin/EligibleStudent";

import ProtectedRoute from "./components/ProtectedRoute";
import CreateProfile from "./pages/student/CreateProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin/AdminDashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute role="admin">
              <Companies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/eligible-students"
          element={
            <ProtectedRoute role="admin">
              <EligibleStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute role="admin">
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* Student */}
        <Route
          path="/student/StudentDashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/drives"
          element={
            <ProtectedRoute role="student">
              <AvailableDrives />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/applications"
          element={
            <ProtectedRoute role="student">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <CreateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/create-profile"
          element={<Navigate to="/student/profile" />}
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
