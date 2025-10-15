import React from "react";
import { Link } from "react-router-dom";
import "./Settings.css";
const Settings = () => {
  return (
    <div>
      <div>
        <h1>Setting</h1>
        <Link to="/resetPassword">
          <button className="button">Change Password</button>
        </Link>
      </div>
    </div>
  );
};

export default Settings;
const styles = {
  button: {},
};
