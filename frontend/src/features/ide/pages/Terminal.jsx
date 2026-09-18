import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import socket from "../sockets/socket";
import { useAuth } from "../../auth/hooks/useAuth";

const Terminal = ({ projectId }) => {
  const terminalRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const term = new XTerminal({
      rows: 20,
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "JetBrains Mono, Fira Code, monospace",
      theme: {
        background: "#0d0d0d",
        foreground: "#cccccc",
        cursor: "#f97316",
      },
      scrollback: 1000,
      rightClickSelectsWord: true,
      macOptionIsMeta: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    setTimeout(() => {
      fitAddon.fit();
      socket.emit("terminal:init", {
        projectId,
        cols: term.cols,
        rows: term.rows,
        userId: user?._id,
      });
    }, 100);

    const handleResize = () => {
      fitAddon.fit();
      socket.emit("terminal:resize", { cols: term.cols, rows: term.rows });
    };
    window.addEventListener("resize", handleResize);

    term.onData((data) => socket.emit("terminal:write", data));
    socket.on("terminal:data", (data) => term.write(data));

    // agent auto run commands
    socket.on("agent:run-command", (cmd) => {
      socket.emit("terminal:write", cmd + "\r");
    });

    terminalRef.current.addEventListener("paste", (e) => {
      const text = e.clipboardData.getData("text");
      socket.emit("terminal:write", text);
      e.preventDefault();
    });

    return () => {
      term.dispose();
      socket.off("terminal:data");
      socket.off("agent:run-command");
      window.removeEventListener("resize", handleResize);
    };
  }, [projectId]);

  return (
    <div
      ref={terminalRef}
      style={{ width: "100%", height: "100%", padding: "4px" }}
    />
  );
};

export default Terminal;
