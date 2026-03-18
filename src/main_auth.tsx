import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppWithAuth from "./AppWithAuth.tsx";
import "./index.css";

console.log('main_auth.tsx carregado');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithAuth />
  </StrictMode>
);

console.log('Render chamado');
