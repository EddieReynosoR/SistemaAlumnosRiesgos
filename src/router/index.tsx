import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import ProtectedPage from "../pages/ProtectedPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Home from "@/pages/Home.tsx";
import App from "../App.tsx";
import RegistroEstudiantes from "@/pages/RegistroEstudiantes.tsx";
import FactoresRiesgo from "@/pages/FactoresRiesgo.tsx";
import Pareto from "@/pages/Pareto.tsx";
import GraficaControl from "@/pages/GraficaControl.tsx";
import Histograma from "@/pages/Histogramas.tsx";
import Dispersion from "@/pages/Dispersion.tsx";
import ExportarDatos from "@/pages/ExportarDatos.tsx";

const router = createBrowserRouter([
  // I recommend you reflect the routes here in the pages folder
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
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
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/protected",
            element: <ProtectedPage />,
          },
          {
            path:"/home",
            element:<Home/>,
          },
          {
            path:"/Registro",
            element:<RegistroEstudiantes/>,
          },
          {
            path:"/Factores",
            element:<FactoresRiesgo/>,
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