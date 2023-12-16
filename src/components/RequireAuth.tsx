import { Navigate, useLocation } from "react-router-dom";

export const RequireAuth = ({
  children,
  requiresAdmin = false,
}: {
  children: JSX.Element;
  requiresAdmin?: boolean;
}) => {
  const isAuthenticated = requiresAdmin
    ? !!localStorage.getItem("bz-userId") &&
      localStorage.getItem("bz-userId") ===
        import.meta.env.VITE_SUPABASE_ADMIN_ID
    : !!localStorage.getItem("bz-userId");
  let location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
