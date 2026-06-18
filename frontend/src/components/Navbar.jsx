import { Link, useLocation } from "react-router-dom"; 
import "../styles/Navbar.css"; 

function Navbar() {
  const location = useLocation(); 

  // This log will print in your browser console to show you exactly what path you are on
  console.log("Current active page path is:", location.pathname);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="custom-navbar">
      <h1 className="navbar-logo">Smart Task Manager</h1>

      <div className="navbar-links">
        {/* We explicitly check the location path to apply the active highlight style manually */}
        <Link 
          to="/tasks" 
          className={`nav-item ${location.pathname === "/tasks" || location.pathname === "/mainhome" ? "active-highlight" : ""}`}
        >
          Tasks
        </Link>

        <Link 
          to="/analytics" 
          className={`nav-item ${location.pathname === "/analytics" ? "active-highlight" : ""}`}
        >
          Analytics
        </Link>

        <Link 
          to="/chatbot" 
          className={`nav-item ${location.pathname === "/chatbot" ? "active-highlight" : ""}`}
        >
          AI Chat
        </Link>

        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;