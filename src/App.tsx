import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./App.css";

const router = getRouter();

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
