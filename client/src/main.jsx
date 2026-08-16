import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import MyRecipes from "./pages/MyRecipes.jsx";
import Auth from "./pages/Auth.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        {/* GENERATE RECIPE */}
        <Route path="/app" element={<App />} />

        {/* MY RECIPES */}
        <Route
          path="/my-recipes"
          element={<MyRecipes />}
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);