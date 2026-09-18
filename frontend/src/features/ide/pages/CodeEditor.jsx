import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useProject } from "../hooks/useProject";

const CodeEditor = () => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [theme, setTheme] = useState(null);
  const { selectedFile, handleSaveFile, project } = useProject();

  const selectedFileRef = useRef(selectedFile);
  const projectRef = useRef(project);

  // keep refs in sync
  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    axios.get("/themes/Github.json").then((res) => setTheme(res.data));
  }, []);

  // load file content when selectedFile changes
  useEffect(() => {
    if (editorRef.current && selectedFile) {
      editorRef.current.setValue(selectedFile.content || "");
    }
  }, [selectedFile]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (theme) {
      monaco.editor.defineTheme("github", theme);
      monaco.editor.setTheme("github");
    }

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      const file = selectedFileRef.current;
      const proj = projectRef.current;
      console.log("saving...", file, proj);
      if (file && proj) {
        const content = editor.getValue();
        await handleSaveFile(proj.projectId, file.path, content);
        console.log("saved:", file.path);
      }
    });
  }

  if (!theme)
    return (
      <div
        style={{ backgroundColor: "#1e1e1e", height: "100%", width: "100%" }}
      />
    );

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      defaultValue="// Select a file to start editing"
      onMount={handleEditorDidMount}
      theme="github"
      options={{
        fontSize: 13,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16 },
      }}
    />
  );
};

export default CodeEditor;
