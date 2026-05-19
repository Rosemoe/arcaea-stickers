import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import { I18nProvider } from "./i18n";

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue[500],
    },
    secondary: {
      main: blue[500],
    },
  },
});

const container = document.getElementById("root");

const tree = (
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// `window.__PRERENDERED__` is rewritten to `true` by scripts/prerender.js after a
// production build. Only then do we hydrate the server-rendered DOM; in dev or
// without a successful prerender we mount fresh to avoid hydration mismatches.
const isPrerendered =
  typeof window !== "undefined" && window.__PRERENDERED__ === true;

if (isPrerendered) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  ReactDOM.createRoot(container).render(tree);
}
