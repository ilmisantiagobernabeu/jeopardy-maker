import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../api/supabase";
import { useGlobalState } from "../../components/GlobalStateProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PageWrapper } from "../../components/PageWrapper";

interface LocationState {
  from?: { pathname: string };
}

export function Login() {
  const { session } = useGlobalState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      // Redirect the user back to the saved location or to the home page if no location is saved
      const state = location.state as LocationState;
      const redirectTo = state?.from || "/"; // Default to the home page if no saved location

      navigate(redirectTo);
    }
  }, [session]);

  if (!session) {
    return (
      <PageWrapper>
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
      </PageWrapper>
    );
  }

  return null;
}
