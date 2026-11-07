import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/**
 * NOTE: StrictMode is intentionally disabled.
 * It double-invokes effects, which double-initialises Lenis smooth-scroll and
 * remounts WebGL contexts (R3F) — that was the source of the "something went
 * wrong" white-screen in earlier builds.
 */
const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
