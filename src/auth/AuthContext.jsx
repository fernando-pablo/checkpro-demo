import { createContext, useContext, useState } from "react";
import { users } from "./users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("checkpro_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    function login(username, password) {
        const foundUser = users.find(
            (user) => user.username === username && user.password === password
        );

        if (!foundUser) {
            return {
                success: false,
                message: "Usuário ou senha inválidos.",
            };
        }

        localStorage.setItem("checkpro_user", JSON.stringify(foundUser));
        setUser(foundUser);

        return {
            success: true,
            user: foundUser,
        };
    }

    function logout() {
        localStorage.removeItem("checkpro_user");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: Boolean(user),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}