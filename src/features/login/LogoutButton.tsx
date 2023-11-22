import React from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        console.log("Signed out successfully");
        localStorage.removeItem("bz-userId");
        localStorage.removeItem("bz-session");
        navigate("/");
        window.location.reload();
        // You can redirect or perform additional actions upon successful logout
      }
    } catch (error) {
      console.error("Error signing out:", (error as any)?.message);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogout}
        className="gold-text text-sm hover:underline focus:underline"
      >
        Logout
      </button>
    </div>
  );
};
