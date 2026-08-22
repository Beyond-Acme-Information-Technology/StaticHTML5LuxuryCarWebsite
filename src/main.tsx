import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { redirectApexToWww } from "./utils/siteUrl";
import "./index.css";
import "./styles/depth.css";

redirectApexToWww();

createRoot(document.getElementById("root")!).render(<App />);
  