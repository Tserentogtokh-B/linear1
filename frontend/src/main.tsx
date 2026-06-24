import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClickToComponent } from "click-to-react-component";
import App from "./App";
import { AuthProvider } from "./auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Alt+дарвал тухайн элементийн эх кодыг editor-д нээнэ (зөвхөн dev) */}
    {import.meta.env.DEV && <ClickToComponent />}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
