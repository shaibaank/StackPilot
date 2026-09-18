import React, { useState, useRef } from "react";
import { useProject } from "../hooks/useProject";
import { saveFileContent } from "../services/file.api";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";

const FileTreeNode = ({
  fileName,
  nodes,
  onFileClick,
  depth = 0,
  parentPath = "",
  isRoot = false,
}) => {
  const isFile = nodes === null;
  const [open, setOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [showInput, setShowInput] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef();
  const currentPath = isRoot
    ? ""
    : parentPath
      ? `${parentPath}/${fileName}`
      : fileName;
  const { project, handleDeleteFile } = useProject();

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleAction = async (action) => {
    setContextMenu(null);
    if (action === "delete") {
      await handleDeleteFile(currentPath);
    } else {
      setShowInput(action);
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const confirmInput = async (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const basePath = currentPath
        ? `${currentPath}/${inputValue}`
        : inputValue;
      if (showInput === "file") {
        await saveFileContent(project.projectId, basePath, "");
      } else if (showInput === "folder") {
        await saveFileContent(project.projectId, `${basePath}/.gitkeep`, "");
      }
      setShowInput(null);
      setInputValue("");
    }
    if (e.key === "Escape") {
      setShowInput(null);
      setInputValue("");
    }
  };

  return (
    <div>
      <div
        onClick={() => (isFile ? onFileClick(currentPath) : setOpen(!open))}
        onContextMenu={handleRightClick}
        style={{ paddingLeft: `${depth * 16}px` }}
        className="flex items-center gap-1 px-2 py-[3px] cursor-pointer hover:bg-[#2a2d2e] text-[#cccccc] text-sm select-none"
      >
        {!isFile && (
          <span style={{ color: "#999", flexShrink: 0 }}>
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        {isFile && <span style={{ width: 12, flexShrink: 0 }} />}
        <span className="text-xs mr-1">{isFile ? "📄" : "📁"}</span>
        <span>{fileName}</span>
      </div>

      {contextMenu && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setContextMenu(null)}
          />
          <div
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: "#252526",
              border: "1px solid #333",
              borderRadius: "6px",
              zIndex: 100,
              minWidth: "160px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            {!isFile && (
              <>
                <button
                  onClick={() => handleAction("file")}
                  style={menuItemStyle}
                >
                  📄 New File
                </button>
                <button
                  onClick={() => handleAction("folder")}
                  style={menuItemStyle}
                >
                  📁 New Folder
                </button>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#333",
                    margin: "2px 0",
                  }}
                />
              </>
            )}
            <button
              onClick={() => handleAction("delete")}
              style={{ ...menuItemStyle, color: "#f87171" }}
            >
              🗑 Delete
            </button>
          </div>
        </>
      )}

      {showInput && (
        <div
          style={{
            paddingLeft: `${(depth + 1) * 16 + 8}px`,
            paddingRight: "8px",
            marginTop: "2px",
          }}
        >
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={confirmInput}
            onBlur={() => {
              setShowInput(null);
              setInputValue("");
            }}
            placeholder={showInput === "file" ? "filename.js" : "folder-name"}
            style={{
              width: "100%",
              backgroundColor: "#2d2d2d",
              border: "1px solid #f97316",
              borderRadius: "3px",
              padding: "2px 6px",
              fontSize: "13px",
              color: "#cccccc",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {!isFile && open && nodes && (
        <div>
          {Object.keys(nodes).map((child) => (
            <FileTreeNode
              key={child}
              fileName={child}
              nodes={nodes[child]}
              onFileClick={onFileClick}
              depth={depth + 1}
              parentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "6px 12px",
  background: "none",
  border: "none",
  color: "#cccccc",
  fontSize: "12px",
  cursor: "pointer",
  textAlign: "left",
};

const FileTree = () => {
  const { fileTree, handleOpenFile, project } = useProject();
  const [showInput, setShowInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const inputRef = useRef();

  const onFileClick = (filePath) => {
    handleOpenFile(project.projectId, filePath);
  };

  const handleNewFile = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmNewFile = async (e) => {
    if (e.key === "Enter" && newFileName.trim()) {
      try {
        await saveFileContent(project.projectId, newFileName, "");
      } catch (err) {
        console.error(err);
      }
      setShowInput(false);
      setNewFileName("");
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setNewFileName("");
    }
  };

  if (!fileTree)
    return <div className="text-[#888888] text-sm px-4 py-2">Loading...</div>;

  return (
    <div className="w-full h-full bg-[#111111] border-r border-[#222222] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <span className="text-xs text-[#888888] uppercase tracking-wider font-medium">
          Explorer
        </span>
        <button
          onClick={handleNewFile}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#888",
            padding: "2px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          title="New File"
        >
          <Plus size={14} />
        </button>
      </div>

      {showInput && (
        <div style={{ padding: "4px 8px" }}>
          <input
            ref={inputRef}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={confirmNewFile}
            onBlur={() => {
              setShowInput(false);
              setNewFileName("");
            }}
            placeholder="filename.js"
            style={{
              width: "100%",
              backgroundColor: "#2d2d2d",
              border: "1px solid #f97316",
              borderRadius: "3px",
              padding: "2px 6px",
              fontSize: "13px",
              color: "#cccccc",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        <FileTreeNode
          fileName={project?.name || "Project"}
          nodes={fileTree}
          onFileClick={onFileClick}
          depth={0}
          isRoot={true}
        />
      </div>
    </div>
  );
};

export default FileTree;
