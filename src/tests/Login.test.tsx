// src/__tests__/SignInPage.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignInPage from "../pages/auth/SignInPage"; // ajusta la ruta si es distinta
import supabase from "../utils/supabaseClient";

// 👇 mock de la función obtenerPerfilDocente del contexto
const mockObtenerPerfilDocente = vi.fn();

// 👇 mock del hook useSession
vi.mock("../context/SessionContext", () => ({
  useSession: () => ({
    session: null, // para estos tests asumimos que NO hay sesión
    obtenerPerfilDocente: mockObtenerPerfilDocente,
  }),
}));

// 👇 mock de supabase
vi.mock("../utils/supabaseClient", () => {
  return {
    default: {
      auth: {
        signInWithPassword: vi.fn(),
      },
    },
  };
});

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el formulario de inicio de sesión cuando no hay sesión activa", () => {
    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("envía los datos correctamente y llama a supabase y obtenerPerfilDocente", async () => {
    // configuramos el mock del login de supabase
    const signInMock = (supabase.auth.signInWithPassword as unknown as ReturnType<
      typeof vi.fn
    >);
    signInMock.mockResolvedValue({ data: {}, error: null });

    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "docente@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    fireEvent.click(submitButton);

    expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: "eddiereynosor@outlook.com",
        password: "123456",
      });

      expect(mockObtenerPerfilDocente).toHaveBeenCalled();
    });
  });
});
