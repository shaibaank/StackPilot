import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useProject } from "../hooks/useProject";
import { useAgent } from "../hooks/useAgent";
import FileTree from "./FileTree";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import {
  LayoutDashboard,
  Play,
  X,
  Globe,
  Send,
  SquareSplitHorizontal,
} from "lucide-react";
import socket from "../sockets/socket";

const IDE = () => {
  const { projectId } = useParams();
  const {
    handleExistingProject,
    project,
    selectedFile,
    setSelectedFile,
    ports,
  } = useProject();
  const { agentMessages, agentLoading, handleAgentRun, clearMessages } =
    useAgent(projectId);
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);
  const [previewPort, setPreviewPort] = useState(3000);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [splitTerminal, setSplitTerminal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    handleExistingProject(projectId);
  }, [projectId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages]);

  const handleRun = () => {
    if (!selectedFile) {
      alert("Open a file first");
      return;
    }
    const fileName = selectedFile.path.split("/").pop();
    const runCommands = {
      javascript: `node ${fileName}\r`,
      typescript: `npx ts-node ${fileName}\r`,
      python: `python3 ${fileName}\r`,
      go: `go run ${fileName}\r`,
      rust: `rustc ${fileName} && ./${fileName.replace(".rs", "")}\r`,
    };
    socket.emit(
      "terminal:write",
      runCommands[project?.language] || `node ${fileName}\r`,
    );
  };

  const handleSend = () => {
    if (!agentPrompt.trim()) return;
    handleAgentRun(agentPrompt);
    setAgentPrompt("");
  };

  const suggestions = [
    "Build a REST API with JWT auth and MongoDB",
    "Create a React dashboard with charts",
    "Build a full e-commerce backend",
    "Create a real-time chat app with Socket.IO",
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0d0d0d",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* LEFT — Agent Chat */}
      <div
        style={{
          width: "360px",
          flexShrink: 0,
          borderRight: "1px solid #1a1a1a",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#e2e2e2",
                fontWeight: "600",
                letterSpacing: "0.01em",
              }}
            >
              APEX
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#444",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              AI Engineer
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {agentMessages.length > 0 && (
              <button
                onClick={clearMessages}
                style={{
                  fontSize: "10px",
                  color: "#444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "3px 6px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                Clear
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#444",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            >
              <LayoutDashboard size={13} />
            </button>
          </div>
        </div>

        {/* messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {agentMessages.length === 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>✦</div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#e2e2e2",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                What are we building?
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#444",
                  lineHeight: "1.7",
                  marginBottom: "20px",
                }}
              >
                Describe your project and APEX will write the entire codebase —
                production grade, no shortcuts.
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setAgentPrompt(s)}
                    style={{
                      padding: "9px 12px",
                      backgroundColor: "#111",
                      border: "1px solid #1a1a1a",
                      borderRadius: "8px",
                      color: "#555",
                      fontSize: "11px",
                      cursor: "pointer",
                      textAlign: "left",
                      lineHeight: "1.5",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#a78bfa44";
                      e.currentTarget.style.color = "#999";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#1a1a1a";
                      e.currentTarget.style.color = "#555";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {agentMessages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "9px 13px",
                      backgroundColor: "#141428",
                      border: "1px solid #1e1e3a",
                      borderRadius: "12px 12px 2px 12px",
                      fontSize: "12px",
                      color: "#ccc",
                      lineHeight: "1.6",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )}

              {msg.role === "loading" && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      flexShrink: 0,
                    }}
                  >
                    ✦
                  </div>
                  <div
                    style={{
                      paddingTop: "4px",
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: "#a78bfa",
                          animation: `bounce 1.2s ${j * 0.2}s ease-in-out infinite`,
                        }}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#444",
                        marginLeft: "6px",
                      }}
                    >
                      Building your application...
                    </span>
                  </div>
                </div>
              )}

              {msg.role === "assistant" && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    ✦
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        lineHeight: "1.7",
                        marginBottom: "10px",
                      }}
                    >
                      {msg.content}
                    </div>

                    {msg.files?.length > 0 && (
                      <div
                        style={{
                          backgroundColor: "#0d0d0d",
                          border: "1px solid #1a1a1a",
                          borderRadius: "8px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            padding: "5px 10px",
                            borderBottom: "1px solid #1a1a1a",
                            fontSize: "10px",
                            color: "#444",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          Files Written
                        </div>
                        {msg.files.map((f) => (
                          <div
                            key={f}
                            style={{
                              padding: "5px 10px",
                              fontSize: "11px",
                              color: "#4ade80",
                              borderBottom: "1px solid #111",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span style={{ color: "#2a2a2a" }}>+</span> {f}
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.installCommands?.length > 0 && (
                      <div
                        style={{
                          backgroundColor: "#0d0d0d",
                          border: "1px solid #1a1a1a",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#444",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginBottom: "5px",
                          }}
                        >
                          Install
                        </div>
                        <code
                          style={{
                            fontSize: "11px",
                            color: "#4fc1ff",
                            wordBreak: "break-all",
                          }}
                        >
                          {msg.installCommands.join(" && ")}
                        </code>
                      </div>
                    )}

                    {msg.startCommand && (
                      <div
                        style={{
                          backgroundColor: "#0d0d0d",
                          border: "1px solid #1a1a1a",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#444",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginBottom: "5px",
                          }}
                        >
                          Start
                        </div>
                        <code style={{ fontSize: "11px", color: "#f97316" }}>
                          {msg.startCommand}
                        </code>
                      </div>
                    )}

                    {msg.envVars && Object.keys(msg.envVars).length > 0 && (
                      <div
                        style={{
                          backgroundColor: "#0d0d0d",
                          border: "1px solid #1a1a1a",
                          borderRadius: "8px",
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#444",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginBottom: "5px",
                          }}
                        >
                          Env Vars
                        </div>
                        {Object.entries(msg.envVars).map(([k, v]) => (
                          <div
                            key={k}
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              fontFamily: "monospace",
                            }}
                          >
                            {k}=<span style={{ color: "#a78bfa" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* input */}
        <div style={{ padding: "12px", borderTop: "1px solid #1a1a1a" }}>
          <div
            style={{
              position: "relative",
              backgroundColor: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: "10px",
            }}
          >
            <textarea
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe what to build..."
              rows={3}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                border: "none",
                padding: "10px 40px 10px 12px",
                fontSize: "12px",
                color: "#ccc",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                lineHeight: "1.6",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.parentElement.style.borderColor = "#a78bfa55")
              }
              onBlur={(e) =>
                (e.target.parentElement.style.borderColor = "#1a1a1a")
              }
            />
            <button
              onClick={handleSend}
              disabled={agentLoading || !agentPrompt.trim()}
              style={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                backgroundColor:
                  agentLoading || !agentPrompt.trim() ? "#1a1a1a" : "#a78bfa",
                border: "none",
                cursor:
                  agentLoading || !agentPrompt.trim()
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.15s",
              }}
            >
              <Send
                size={12}
                color={agentLoading || !agentPrompt.trim() ? "#333" : "#fff"}
              />
            </button>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#2a2a2a",
              marginTop: "6px",
              textAlign: "center",
            }}
          >
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* RIGHT — IDE */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* navbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            borderBottom: "1px solid #1a1a1a",
            backgroundColor: "#0d0d0d",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "12px", color: "#555" }}>
            {project?.name}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: showPreview ? "#4fc1ff" : "#555",
                background: showPreview ? "rgba(79,193,255,0.08)" : "none",
                border: "1px solid",
                borderColor: showPreview
                  ? "rgba(79,193,255,0.2)"
                  : "transparent",
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "4px",
              }}
            >
              <Globe size={11} /> Preview
            </button>
            <button
              onClick={handleRun}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#fff",
                background: "#f97316",
                border: "none",
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "4px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ea6c0a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#f97316")
              }
            >
              <Play size={11} /> Run
            </button>
          </div>
        </div>

        {/* IDE body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* file tree */}
          <div style={{ width: "200px", flexShrink: 0 }}>
            <FileTree />
          </div>

          {/* editor + terminal */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* tab bar */}
            <div
              style={{
                height: "35px",
                backgroundColor: "#0d0d0d",
                borderBottom: "1px solid #1a1a1a",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {selectedFile ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0 16px",
                    height: "100%",
                    borderBottom: "2px solid #f97316",
                    fontSize: "12px",
                    color: "#ccc",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: "10px" }}>📄</span>
                  <span>{selectedFile.path.split("/").pop()}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#444",
                      cursor: "pointer",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <span
                  style={{ fontSize: "12px", color: "#333", padding: "0 16px" }}
                >
                  No file open
                </span>
              )}
            </div>

            {/* editor + preview */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <CodeEditor />
              </div>
              {showPreview && (
                <div
                  style={{
                    width: "45%",
                    borderLeft: "1px solid #1a1a1a",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "35px",
                      backgroundColor: "#0d0d0d",
                      borderBottom: "1px solid #1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      gap: "8px",
                    }}
                  >
                    <Globe size={11} color="#4fc1ff" />
                    <select
                      value={previewPort}
                      onChange={(e) => setPreviewPort(Number(e.target.value))}
                      style={{
                        fontSize: "11px",
                        background: "#1a1a1a",
                        color: "#ccc",
                        border: "1px solid #222",
                        borderRadius: "3px",
                        padding: "2px 4px",
                      }}
                    >
                      <option value={3000}>:3000</option>
                      <option value={5173}>:5173</option>
                      <option value={8080}>:8080</option>
                    </select>
                    <span style={{ fontSize: "11px", color: "#444" }}>
                      localhost:{ports?.[previewPort]}
                    </span>
                    <button
                      onClick={() => setShowPreview(false)}
                      style={{
                        marginLeft: "auto",
                        background: "none",
                        border: "none",
                        color: "#444",
                        cursor: "pointer",
                        display: "flex",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#444")
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <iframe
                    key={ports?.[previewPort]}
                    src={`http://localhost:${ports?.[previewPort]}`}
                    style={{
                      flex: 1,
                      border: "none",
                      backgroundColor: "white",
                    }}
                    title="preview"
                  />
                </div>
              )}
            </div>

            {/* terminal */}
            <div
              style={{
                height: "220px",
                borderTop: "1px solid #1a1a1a",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  height: "28px",
                  backgroundColor: "#0d0d0d",
                  borderBottom: "1px solid #1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#444",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Terminal
                </span>
                <button
                  onClick={() => setSplitTerminal(!splitTerminal)}
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10px",
                    color: splitTerminal ? "#a78bfa" : "#444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = splitTerminal
                      ? "#a78bfa"
                      : "#444")
                  }
                  title="Split terminal"
                >
                  <SquareSplitHorizontal size={12} /> Split
                </button>
              </div>
              <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                <div
                  style={{
                    flex: 1,
                    borderRight: splitTerminal ? "1px solid #1a1a1a" : "none",
                    overflow: "hidden",
                  }}
                >
                  {projectId && <Terminal key="t1" projectId={projectId} />}
                </div>
                {splitTerminal && (
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    {projectId && <Terminal key="t2" projectId={projectId} />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        textarea::placeholder { color: #333; }
        * { scrollbar-width: thin; scrollbar-color: #1f1f1f transparent; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default IDE;
