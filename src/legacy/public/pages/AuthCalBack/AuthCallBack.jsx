import { useEffect } from "react";
import { useSearchParams, useNavigate } from '@/lib/router-compat';
import { jwtDecode } from "jwt-decode";
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import axios from "axios";
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // const token = searchParams.get("id_token");
    // console.log(token)
    // if (token) {
    //   const decoded = jwtDecode(token);

    //   const userData = {
    //     name: decoded.name,
    //     email: decoded.email,
    //   };

    //   localStorage.setItem("googleUser", JSON.stringify(userData));

    //   navigate("/organization/registration");
    // }
        // Get the hash fragment from the URL (remove the #)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("id_token");
    
    console.log("Token from hash:", token);

    if (token) {
      const decoded = jwtDecode(token);
      const userData = {
        name: decoded.name,
        email: decoded.email,
      };
      localStorage.setItem("googleUser", JSON.stringify(userData));
      navigate("/organization/registration");
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
}