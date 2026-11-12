import { hydrateRoot } from "react-dom/client";
import { Route } from "./routes/index";
import "./styles.css";
const Portfolio = Route.options.component as React.ComponentType;
hydrateRoot(document.getElementById("root")!, <Portfolio />);
