import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import ProtectedPage from "../pages/ProtectedPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import RegistroEstudiantes from "@/pages/RegistroEstudiantes.tsx";
import App from "../App.tsx";
import Pareto from "@/pages/Pareto.tsx";
import GraficaControl from "@/pages/GraficaControl.tsx";
import Histograma from "@/pages/Histogramas.tsx";
import Dispersion from "@/pages/Dispersion.tsx";
import ExportarDatos from "@/pages/ExportarDatos.tsx";
import EstudiantesPage from "@/pages/EstudiantesPage.tsx";
import MateriasPage from "@/pages/MateriasPage.tsx";
import FactoresPage from "@/pages/FactoresPage.tsx";
import CarrerasPage from "@/pages/CarrerasPage.tsx";
import ImportarDatos from "@/pages/ImportarDatos.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/protected",
            element: <ProtectedPage />,
          },
          {
            path:"/Registro",
            element:<RegistroEstudiantes/>,
          },
          {
            path:"/Pareto",
            element:<Pareto/>,
          },
          {
            path:"/GraficoControl",
            element:<GraficaControl/>,
          },
          {
            path:"/Histograma",
            element:<Histograma/>,
          },
          {
            path:"/Dispersion",
            element:<Dispersion/>
          },
          {
            path:"/Exportar",
            element:<ExportarDatos/>
          },
          {
            path: "/Estudiantes",
            element: <EstudiantesPage />
          },
          {
            path: "/Materias",
            element: <MateriasPage />
          },
          {
            path: "/Factores",
            element: <FactoresPage />
          },
          {
            path: "/Carreras",
            element: <CarrerasPage />
          },
          {
            path: "/Importar",
            element: <ImportarDatos />
          }
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;