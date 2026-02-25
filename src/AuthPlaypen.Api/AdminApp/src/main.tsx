import { render } from "solid-js/web";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import App from "./App";
import "./index.css";
import { loadRuntimeConfig } from "./services/runtimeConfig";

const queryClient = new QueryClient();

async function bootstrap() {
  await loadRuntimeConfig();

  render(
    () => (
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    ),
    document.getElementById("root")!,
  );
}

void bootstrap();
