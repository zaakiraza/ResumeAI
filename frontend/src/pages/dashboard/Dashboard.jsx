import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/resetPassword">
        <button style={styles.button}>Change Password</button>
      </Link>
    </div>
  );
}

export default Dashboard;

const styles = {
  button: {
    padding: "10px 15px",
    backgroundColor: "#008a7c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
