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
      <div className="w-full h-full flex justify-center items-center bg-[#060ce9]">
        <div className="flex flex-col gap-4 w-full max-w-lg">
          <h1 className="text-7xl font-bold font-korinna gold-text text-center">
            BUZZINGA
          </h1>
          <div className="bg-white rounded-lg px-6 py-3 shadow-md">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              redirectTo="https://buzzinga.io"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
