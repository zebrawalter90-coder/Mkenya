import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";
import { API_BASE_URL } from "./lib/api-url";

if (API_BASE_URL) {
  setBaseUrl(API_BASE_URL);
}

createRoot(document.getElementById("root")!).render(<App />);
