import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const userToken = localStorage.getItem("token");

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 3 && value !== "") {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    if (otp.includes("")) {
      setMessage("Please enter all 4 digits.");
      return;
    }

    const otpString = otp.join("");

    try {
      const res = await axios.post(
        "http://localhost:5003/api/auth/verifyOtp",
        { otp: otpString },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.data.status) {
        navigate("/dashboard");
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  // Handle OTP resend request
  const handleResendOtp = async () => {
    try {
      const res = await axios.get("http://localhost:5003/api/auth/resendOtp", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (res.data.status) {
        setMessage("OTP has been resent to your email.");
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    } else if (e.key === " ") {
      e.preventDefault();
    }
  };

  const handlePaste = (e, index) => {
    const pastedData = e.clipboardData.getData("Text");

    if (pastedData.length === 4 && /^[0-9]+$/.test(pastedData)) {
      setOtp(pastedData.split(""));
    }
    e.preventDefault();
  };

  return (
    <div style={styles.verifyForm}>
      <h1>Verify OTP</h1>
      <div style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            style={styles.otpInput}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            autoFocus={index === 0}
          />
        ))}
      </div>
      <button style={styles.button} onClick={handleVerify}>
        Verify OTP
      </button>
      <button style={styles.button} onClick={handleResendOtp}>
        Resend OTP
      </button>
      {message && <p style={styles.error}>{message}</p>}
    </div>
  );
}

export default VerifyOtp;

const styles = {
  verifyForm: {
    maxWidth: "25%",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: "20px 0",
  },
  otpInput: {
    width: "50px",
    height: "50px",
    textAlign: "center",
    fontSize: "20px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    margin: "0 10px",
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
  error: {
    color: "red",
  },
};
