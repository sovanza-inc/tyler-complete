import React, { useState, useEffect } from "react";
import "../assets/css/layout.css";
import "../assets/css/userDropdown.css";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import ProfileDropdown from "../Componenets/ProfileDropdown";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // State to track whether the sidebar is shown or not
  const [isSidebarShown, setIsSidebarShown] = useState(false);

  // Handle clicks outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('side-bar');
      const hamburger = document.getElementById('topnav-hamburger-icon');
      
      if (isSidebarShown && 
          sidebar && 
          !sidebar.contains(event.target) && 
          !hamburger.contains(event.target)) {
        setIsSidebarShown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarShown]);

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarShown(!isSidebarShown);
  };

  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      const element = document.documentElement;
      element.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    // Clean up the event listener
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <>
      <div className="d-flex position-relative">
        <aside
          id="side-bar"
          className={`sideBar ${isSidebarShown ? "sideBar-show" : ""}`}
        >
          <div className="">
            <div className="d-lg-none text-end mt-2">
              <button
                type="button"
                onClick={toggleSidebar}
                class=""
                id="topnav-hamburger-icon"
              >
                <span class="hamburger-icon open">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div>
            <div className="logo-wrap">
              <Link to="/">
                <img src="img/logo2.svg" alt="logo" />
              </Link>
            </div>
            <div className="sidebar-menu">
              <ul className="">
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/"
                  >
                    <i class="fa-solid fa-chalkboard-user"></i>
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/estimate"
                  >
                    <i class="fa-regular fa-rectangle-list"></i>
                    <span>Estimate</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/contract"
                  >
                    <i class="fa-solid fa-file-contract"></i>{" "}
                    {/* <i class="fa-solid fa-chart-line"></i> */}
                    <span>Contract</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/threshold"
                  >
                    <i class="fa-regular fa-calendar"></i>
                    <span>Threshold</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/blueprint"
                  >
                    <i class="fa-solid fa-book"></i>
                    {/* <i class="fa-solid fa-chart-line"></i> */}
                    <span>Blueprint</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/settings"
                  >
                    <i class="fa-solid fa-gears"></i>
                    <span>Setting</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className=""
                    style={({ isActive }) => ({
                      textDecoration: "underline",
                      color: isActive ? "white" : "#737791", // White if active, default otherwise
                    })}
                    to="/payment"
                  >
                    <i class="fa-solid fa-credit-card"></i>
                    <span>Payment</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          {/* <h3>Sidebar</h3> */}
        </aside>
        <div className="body-main">
          <header className="navBar">
            <div class="row flex-row align-items-center justify-content-center">
              <div className="col-4 col-lg-0 d-lg-none">
                <div className="d-flex flex-row justify-content-start align-items-center">
                  <div className="">
                    <button
                      type="button"
                      onClick={toggleSidebar}
                      class=""
                      id="topnav-hamburger-icon"
                    >
                      <span class={`hamburger-icon ${isSidebarShown ? "open" : ""}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      
                    </button>
                    
                  </div>
                  {/* logo for mobile screen */}
                  {/* <div className="logo-wrap-sm nav-sm-logo">
                    <Link to="/">
                      <div>
                        <img
                          className="nav-logo-big"
                          src="img/logo2.svg"
                          alt="logo"
                        />
                      </div>
                    </Link>
                    <Link to="/">
                      <img
                        className="nav-logo-sm"
                        style={{ maxWidth: "50px" }}
                        src="/img/logo3.svg"
                        alt="logo"
                      />
                    </Link>
                  </div> */}
                </div>
              </div>
              <div className="col-8 col-lg-12">
                <div className="d-flex nav-items text-white nav-side-icons justify-content-end">
                  <div
                    className="d-none d-sm-block"
                    style={{ marginTop: "5px" }}
                  >
                    <div className="searchbar-outer">
                      <form class="search-form">
                        <div class=" position-relative ">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Search"
                          />
                          <div className="focus-sec">
                          <button class="s-btn" type="submit">
                            <i class="fa-solid fa-magnifying-glass"></i>
                          </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div class="">
                    <div className="flag-sec">
                    <button
                      type="button"
                      class="btn  flag btn-icon rounded-circle"
                    >
                      <img
                        id="header-lang-img"
                        src="img/english.svg"
                        alt="Header Language"
                        height="20"
                        class="rounded"
                      />
                    </button>
                    </div>
                    <div class="dropdown-menu-ww">
                      {/* <!-- item--> */}
                      {/* <a href="javascript:void(0);" class="dropdown-item notify-item language py-2" data-lang="en" title="English" contenteditable="false">
                            <img src="assets/images/flags/us.svg" alt="user-image" class="me-2 rounded" height="18"/>
                            <span class="align-middle">English</span>
                        </a> */}
                    </div>
                  </div>
                  {/* <div className="d-md-none d-block">
                      <button
                        type="button"
                        class="btn btn-icon rounded-circle"
                        data-toggle="fullscreen"
                      >
                        <i class="fa-solid fa-search"></i>
                      </button>
                    </div> */}
                  <div className="">
                    <button
                      type="button"
                      className="btn btn-icon rounded-circle"
                      onClick={toggleFullScreen}
                    >
                      <i
                        className={`fa-solid ${
                          isFullScreen ? "fa-compress" : "fa-expand"
                        }`}
                      ></i>
                    </button>
                  </div>
                  <div className="position-relative">
                    <button
                      className="profile-button"
                      onClick={toggleUserDropdown}
                      aria-label="User menu"
                    >
                      <i className="far fa-user-circle"></i>
                      <span className="status-indicator"></span>
                    </button>
                    {showUserDropdown && (
                      <div className="user-dropdown">
                        <div className="user-info p-3">
                          <div className="user-header d-flex align-items-center gap-3 mb-1">
                            <div className="user-avatar">
                              {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                              <div className="user-name">{user?.fullName}</div>
                              <div className="user-email">{user?.email}</div>
                            </div>
                          </div>
                          <div className="user-actions">
                            <button 
                              className="dropdown-item"
                              onClick={() => navigate('/profile')}
                            >
                              <i className="fas fa-user-circle"></i>
                              My Profile
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => navigate('/settings')}
                            >
                              <i className="fas fa-sliders-h"></i>
                              Settings
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={handleLogout}
                            >
                              <i className="fas fa-power-off"></i>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="">
                    <button className="btn-icon rounded-circle">
                      <i className="fa-regular fa-bell"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="mainWraper">
            <div className="" style={{ paddingTop: "60px" }}></div>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
