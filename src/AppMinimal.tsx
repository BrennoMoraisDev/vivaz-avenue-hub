import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const queryClient = new QueryClient();

export default function AppMinimal() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div style={{ padding: '20px' }}>✅ App Minimal funcionando!</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
