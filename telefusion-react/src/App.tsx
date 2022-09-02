import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ImagineWidget } from "./ImagineWidget/ImagineWidget";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ImagineWidget />
    </QueryClientProvider>
  );
}
