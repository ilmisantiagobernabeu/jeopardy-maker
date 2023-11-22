import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../api/supabase";
import { useGlobalState } from "../../components/GlobalStateProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function Login() {
  const { session } = useGlobalState();

  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session]);

  if (!session) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-[#121425] ">
        <div className="w-full max-w-lg">
          <h1 className="text-7xl font-bold font-korinna gold-text text-center">
            BUZZINGA
          </h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
          />
        </div>
      </div>
    );
  }

  return null;
}
