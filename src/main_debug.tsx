import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log('main_debug.tsx carregado');

function AppDebug() {
  console.log('AppDebug renderizado');
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>✅ Debug funcionando!</h1>
      <p>Se você vê esta mensagem, o React foi renderizado com sucesso.</p>
    </div>
  );
}

console.log('Criando root...');
const root = createRoot(document.getElementById("root")!);
console.log('Root criado, renderizando...');

root.render(
  <StrictMode>
    <AppDebug />
  </StrictMode>
);

console.log('Render chamado');
