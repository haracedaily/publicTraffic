import "@ant-design/v5-patch-for-react-19";
import "./index.css";
import App from "./App.jsx";

import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
