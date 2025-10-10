import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Password should match from confirm password");
      return;
    }
    try {
      const api = await axios.post(
        "https://resume-backend-roan-nu.vercel.app/api/auth/changePassword",
        {
          oldPassword: oldPassword,
          newPassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(api.data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={styles.loginForm}>
      <h1>Reset Password</h1>
      <form
        style={styles.form}
        onSubmit={(e) => {
          handleSubmitPassword(e);
        }}
      >
        <div style={styles.passwordInputWrapper}>
          <input
            type={showOldPassword ? "text" : "password"}
            style={styles.input}
            placeholder="Old Password"
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            style={styles.eyeButton}
          >
            {/* {showOldPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} */}
          </button>
        </div>

        <div style={styles.passwordInputWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            style={styles.input}
            placeholder="Type New Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {/* {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} */}
          </button>
        </div>

        <div style={styles.passwordInputWrapper}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            style={styles.input}
            placeholder="Confirm New Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            {/* {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} */}
          </button>
        </div>

        <button style={styles.button} type="submit">
          Reset Password
        </button>
      </form>
      <p style={styles.p}>{message ? message : "loading..."}</p>
    </div>
  );
}

const styles = {
  loginForm: {
    maxWidth: "25%",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    width: "90%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#008a7c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  p: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#777",
  },
  passwordWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  passwordInputWrapper: {
    position: "relative",
    width: "100%",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "18px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#008a7c",
    fontSize: "20px",
  },
};

export default ResetPassword;
