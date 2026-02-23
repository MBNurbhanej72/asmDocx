import { createBrowserRouter } from "react-router-dom";
import EmailGenerator from "../components/EmailGenerator";
import About from "../Pages/About";
import ApplicationGenerator from "../components/ApplicationGenerator";
import ContactUs from "../Pages/ContactUs";
import ProtectedRoutes from "./ProtectedRoutes";
import Home from "../Pages/Home";
import NotFound from "../Pages/NotFound";
import AdminRoute from "./AdminRoute";
import MyDocs from "../Pages/MyDocs";



export const router = createBrowserRouter([
  {
    path: "/", element: <ProtectedRoutes />, children: [
      { path: "", element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact-us", element: <ContactUs /> },
      { path: "email-generator", element: <EmailGenerator /> },
      { path: "application-generator", element: <ApplicationGenerator /> },
      { path: "my-docs", element: <MyDocs /> },
    ]
  },

  {
    path: "/admin", element: <AdminRoute />
  },

  { path: "*", element: <NotFound /> }

]);