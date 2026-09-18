import { BrowserRouter, Routes, Route } from "react-router";
import SignIn from "./features/auth/pages/SignIn";
import IDE from "./features/ide/pages/IDE";
import SignUp from "./features/auth/pages/SignUp";
import Dashboard from "./features/ide/pages/Dashboard";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<IDE />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
