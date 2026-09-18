import React from "react";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./features/auth/auth.context";
import { ProjectProvider } from "./features/ide/project.context";
const App = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppRoutes />
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
