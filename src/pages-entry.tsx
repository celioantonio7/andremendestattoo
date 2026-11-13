import { hydrateRoot } from "react-dom/client";
import { NotFoundPage } from "./components/portfolio/NotFoundPage";
import { Route } from "./routes/index";
import "./styles.css";
const isHome = [import.meta.env.BASE_URL, `${import.meta.env.BASE_URL}index.html`].includes(
  location.pathname,
);
const Portfolio = isHome ? (Route.options.component as React.ComponentType) : NotFoundPage;
hydrateRoot(document.getElementById("root")!, <Portfolio />);
