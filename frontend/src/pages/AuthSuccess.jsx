import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    } else if (error) {
      // Handle error and redirect to signin with error message
      navigate("/signin?error=" + error, { replace: true });
    } else {
      // No token or error, redirect to signin
      navigate("/signin", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
      }}
    >
      <div>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          Processing authentication...
        </div>
        <div
          style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        ></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AuthSuccess;
