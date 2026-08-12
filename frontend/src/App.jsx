import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AuthorExplorer from "./pages/AuthorExplorer";
import AuthorDetail from "./pages/AuthorDetail";
import PaperExplorer from "./pages/PaperExplorer";
import PaperDetail from "./pages/PaperDetail";
import TopicExplorer from "./pages/TopicExplorer";
import TopicDetail from "./pages/TopicDetail";
import CollaborationPath from "./pages/CollaborationPath";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/authors" element={<AuthorExplorer />} />
        <Route path="/authors/:id" element={<AuthorDetail />} />
        <Route path="/papers" element={<PaperExplorer />} />
        <Route path="/papers/:id" element={<PaperDetail />} />
        <Route path="/topics" element={<TopicExplorer />} />
        <Route path="/topics/:id" element={<TopicDetail />} />
        <Route path="/path" element={<CollaborationPath />} />
      </Route>
    </Routes>
  );
}
