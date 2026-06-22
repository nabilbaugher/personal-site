import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import Draft13 from "./drafts/Draft13.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiet-index" element={<Draft13 />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        {/* Three index layouts to compare; pick one and drop the rest. */}
        <Route path="/work" element={<Projects variant="ledger" />} />
        <Route path="/work-b" element={<Projects variant="rich" />} />
        <Route path="/work-c" element={<Projects variant="cards" />} />
        <Route path="/work/:slug" element={<ProjectDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
