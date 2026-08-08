import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

// Where each role lands when redirected away from a page it can't access
const ROLE_HOME_ROUTES = {
  admin: "/dashboard",
  teacher: "/teacher-dashboard",
  student: "/student-dashboard",
};

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // No role restriction on this route - any authenticated user passes
  if (!allowedRoles) {
    return children;
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  if (allowedRoles.includes(role)) {
    return children;
  }

  // Role mismatch - redirect to the user's own dashboard instead of
  // rendering the page. Sidebar hiding is only a UI convenience;
  // this redirect is the actual access control on the frontend.
  const homeRoute = ROLE_HOME_ROUTES[role];

  if (homeRoute) {
    return <Navigate to={homeRoute} replace />;
  }

  // Unknown/missing role (should not normally happen) - fall back to
  // an inline denial so we never redirect-loop
  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-6">
      <div className="surface max-w-sm w-full p-8 text-center">
        <div className="w-11 h-11 border border-danger bg-danger-soft flex items-center justify-center mx-auto mb-5">
          <ShieldAlert size={20} strokeWidth={1.8} className="text-danger" />
        </div>

        <h1 className="font-display font-bold text-xl text-ink tracking-tight">
          Access Forbidden
        </h1>

        <p className="text-[0.8125rem] text-ink-soft mt-2 leading-relaxed">
          Your role{role ? ` (${role})` : ""} doesn't have permission to view
          this page.
        </p>

        <a href="/" className="btn-solid inline-flex mt-6">
          Back to Login
        </a>
      </div>
    </div>
  );
}

export default ProtectedRoute;