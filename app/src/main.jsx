import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./app/providers/AppProviders.jsx";
import { router } from "./app/router.jsx";
import "./pwa.js";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
