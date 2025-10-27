// Routes
import ProtectedRoutes from "./Routes/ProtectedRoutes";

// Navbars
import Navbar from "./components/PublicComponents/navbar/Navbar";
import DashboardNavbar from "./components/ProtectedComponents/dashboardNavbar/DashboardNavbar";

// Public Pages
import Home from "./pages/PublicPages/home/Home";
import About from "./pages/PublicPages/about/About";
import Services from "./pages/PublicPages/services/Services";
import Contact from "./pages/PublicPages/contact/Contact";
import Faq from "./pages/PublicPages/faq/Faq";
import VerifyOtp from "./pages/PublicPages/VerifyOtp/VerifyOtp";
import ForgotPassword from "./pages/PublicPages/forgotPassword/orgotPassword";
import SignIn from "./pages/PublicPages/login/ignin";
import Signup from "./pages/PublicPages/register/signup";

// Protected Pages
import Dashboard from "./pages/ProtectedPages/dashboard/Dashboard";
import ResetPassword from "./pages/ProtectedPages/ResetPassword/esetPassword";
import AITools from "./pages/ProtectedPages/AITools/AITools";
import CreateResume from "./pages/ProtectedPages/CreateResume/CreateResume";
import EditResume from "./pages/ProtectedPages/EditResume/EditResume";
import HelpSupport from "./pages/ProtectedPages/HelpSupport/HelpSupport";
import MyResumes from "./pages/ProtectedPages/MyResumes/MyResumes";
import Notifications from "./pages/ProtectedPages/notifications/Notifications";
import Profile from "./pages/ProtectedPages/Profile/Profile";
import Settings from "./pages/ProtectedPages/Settings/Settings";
// import ViewResumePDF from "./pages/ProtectedPages/ViewResumePDF/ViewResumePDF";
import AuthSuccess from "./pages/AuthSuccess";

import { Route, Routes, useLocation } from "react-router-dom";

function App() {
  const dashboardAllowed = [
    "/",
    "/home",
    "/signin",
    "/signup",
    "/about",
    "/services",
    "/contact",
    "/faq",
  ];

  const dashboardNavbarAllowed = [
    "/dashboard",
    "/ai-tools",
    "/create-resume",
    "/edit-resume",
    "/helpSupport",
    "/my-resumes",
    "/notifications",
    "/profile",
    "/settings",
  ];

  const location = useLocation();
  const isDashboardAllowed = dashboardAllowed.includes(location.pathname);
  const isDashboardNavbarAllowed = dashboardNavbarAllowed.includes(
    location.pathname
  );
  return (
    <>
      {isDashboardAllowed && <Navbar />}
      {isDashboardNavbarAllowed && <DashboardNavbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />

        <Route path="/VerifyOtp" element={<VerifyOtp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/create-resume" element={<CreateResume />} />
          <Route path="/edit-resume/:id" element={<EditResume />} />
          <Route path="/helpSupport" element={<HelpSupport />} />
          <Route path="/my-resumes" element={<MyResumes />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
