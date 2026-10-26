import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import GestorDashboard from "../pages/gestor/GestorDashboard";
import PCMDashboard from "../pages/pcm/PCMDashboard";
import EletricistaDashboard from "../pages/eletricista/EletricistaDashboard";
import Relatorio from "../pages/Relatorio";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />

            <Route
                path="/gestor"
                element={
                    <ProtectedRoute allowedRoles={["gestor"]}>
                        <GestorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/pcm"
                element={
                    <ProtectedRoute allowedRoles={["pcm"]}>
                        <PCMDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/eletricista"
                element={
                    <ProtectedRoute allowedRoles={["eletricista"]}>
                        <EletricistaDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/relatorio"
                element={
                    <ProtectedRoute allowedRoles={["gestor", "pcm"]}>
                        <Relatorio />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}