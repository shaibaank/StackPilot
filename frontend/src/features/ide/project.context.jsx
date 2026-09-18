import { createContext } from "react";
import {
  createProject,
  getProjectDetails,
  getAllProjects,
  deleteProject,
} from "./services/project.api";
import {
  getFileContent,
  saveFileContent,
  deleteFileOrFolder,
} from "./services/file.api";
import { useState, useEffect } from "react";
import socket from "./sockets/socket";
export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState({});

  useEffect(() => {
    socket.on("filetree:update", (fileTree) => setFileTree(fileTree));
    socket.on("ports:update", (ports) => {
      console.log("ports received:", ports);
      console.log("port 3000:", ports[3000]); // add this
      setPorts(ports);
    });
    return () => {
      socket.off("filetree:update");
      socket.off("ports:update"); // add this
    };
  }, []);
  const handleCreateProject = async (name, language) => {
    setLoading(true);
    try {
      const response = await createProject({ name, language });
      const newProject = response.project;

      const details = await getProjectDetails(newProject.projectId);
      setProject({ name: details.name, projectId: details.projectId });
      setFileTree(details.fileTree);
      setPorts(details.ports || {});

      return newProject;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleExistingProject = async (projectId) => {
    setLoading(true);
    try {
      const details = await getProjectDetails(projectId);
      setProject({ name: details.name, projectId: details.projectId });
      setFileTree(details.fileTree);
      setPorts(details.ports || {});
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllProjects = async () => {
    setLoading(true);
    try {
      const response = await getAllProjects();
      return response.projects || [];
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
    } catch (err) {
      throw err;
    }
  };
  const handleOpenFile = async (projectId, filePath) => {
    try {
      const response = await getFileContent(projectId, filePath);
      setSelectedFile({ path: filePath, content: response.content });
    } catch (err) {
      throw err;
    }
  };

  const handleSaveFile = async (projectId, filePath, content) => {
    try {
      await saveFileContent(projectId, filePath, content);
    } catch (err) {
      throw err;
    }
  };
  const handleDeleteFile = async (filePath) => {
    try {
      await deleteFileOrFolder(project.projectId, filePath);
    } catch (err) {
      throw err;
    }
  };
  return (
    <ProjectContext.Provider
      value={{
        project,
        fileTree,
        selectedFile,
        setSelectedFile,
        loading,
        ports,
        handleCreateProject,
        handleExistingProject,
        handleGetAllProjects,
        handleDeleteProject,
        handleOpenFile,
        handleSaveFile,
        handleDeleteFile,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
