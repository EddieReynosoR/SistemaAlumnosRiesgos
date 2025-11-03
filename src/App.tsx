import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";

export default function App() {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  )
}