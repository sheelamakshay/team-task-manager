import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="navbar">
      <h2>Task Manager</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;