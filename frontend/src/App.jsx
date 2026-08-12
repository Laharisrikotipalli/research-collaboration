import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AuthorExplorer from "./pages/AuthorExplorer";
import PaperExplorer from "./pages/PaperExplorer";
import TopicExplorer from "./pages/TopicExplorer";
import CollaborationPath from "./pages/CollaborationPath";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AuthorExplorer />} />
        <Route path="/papers" element={<PaperExplorer />} />
        <Route path="/topics" element={<TopicExplorer />} />
        <Route path="/path" element={<CollaborationPath />} />
      </Route>
    </Routes>
  );
}
