import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Selector from "./Selector.jsx";
import Draft1 from "./drafts/Draft1.jsx";
import Draft4 from "./drafts/Draft4.jsx";
import Draft7 from "./drafts/Draft7.jsx";
import Draft8 from "./drafts/Draft8.jsx";
import Draft9 from "./drafts/Draft9.jsx";
import Draft10 from "./drafts/Draft10.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Selector />} />
        <Route path="/draft-1" element={<Draft1 />} />
        <Route path="/draft-4" element={<Draft4 />} />
        <Route path="/draft-7" element={<Draft7 />} />
        <Route path="/draft-8" element={<Draft8 />} />
        <Route path="/draft-9" element={<Draft9 />} />
        <Route path="/draft-10" element={<Draft10 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
