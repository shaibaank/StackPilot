import { useState, useEffect } from "react";
import { Zap, Plus, FolderOpen, Trash2, Code2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useProject } from "../hooks/useProject";
import { useAuth } from "../../auth/hooks/useAuth";

const languageIcons = {
  javascript: "JS",
  typescript: "TS",
  python: "PY",
  go: "GO",
  rust: "RS",
};

const languageColors = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python: "#3572A5",
  go: "#00ADD8",
  rust: "#ce422b",
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [creating, setCreating] = useState(false);
  const { handleCreateProject, handleGetAllProjects, handleDeleteProject } =
    useProject();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    handleGetAllProjects().then((p) => {
      setProjects(Array.isArray(p) ? p : []);
    });
  }, []);

  const onLogout = async () => {
    await handleLogout();
    navigate("/sign-in");
  };

  const onCreate = async () => {
    if (!projectName.trim()) return;
    setCreating(true);
    try {
      const project = await handleCreateProject(projectName, language);
      navigate(`/project/${project.projectId}`);
    } catch (err) {
      console.error("create error:", err);
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (e, projectId) => {
    e.stopPropagation();
    try {
      await handleDeleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.projectId !== projectId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f7]">
      {/* navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e8e4df]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-black text-lg font-bold tracking-tight">
            FlowStack
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-black transition border border-gray-200 px-3 py-1.5 rounded-full hover:border-gray-400"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* main content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-black">Your Projects</h1>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* projects grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f0ece6] flex items-center justify-center mb-4">
              <Code2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-black">No projects yet</h2>
            <p className="text-sm text-gray-500 mt-2">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.projectId}
                className="bg-white border border-[#e8e4df] rounded-2xl p-5 hover:border-[#d0cac3] hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      backgroundColor:
                        languageColors[project.language] || "#888",
                    }}
                  >
                    {languageIcons[project.language] || "?"}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-black text-sm mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-400 capitalize mb-4">
                  {project.language}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/project/${project.projectId}`)}
                    className="flex-1 flex items-center justify-center gap-2 border border-[#e8e4df] rounded-full py-2 text-xs font-medium text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-200"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Open
                  </button>
                  <button
                    onClick={(e) => onDelete(e, project.projectId)}
                    className="flex items-center justify-center border border-[#e8e4df] rounded-full px-3 py-2 text-xs text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* create project modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-[#e8e4df]">
            <h2 className="text-lg font-semibold text-black mb-1">
              New Project
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Set up your development environment
            </p>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Project Name
              </label>
              <input
                type="text"
                placeholder="my-awesome-app"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Language
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(languageIcons).map(([lang, icon]) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                      language === lang
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={
                      language === lang ? {} : { color: languageColors[lang] }
                    }
                  >
                    {icon}
                    <span className="text-[9px] font-normal capitalize">
                      {lang}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-full py-2.5 text-sm text-gray-600 hover:border-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                disabled={creating || !projectName.trim()}
                className="flex-1 bg-black text-white rounded-full py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
