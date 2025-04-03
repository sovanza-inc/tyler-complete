import React, { useState } from "react";
// import "./ProfileDropdown.css"; // Import the CSS for the component

const ProfileDropdown = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="user-id p-0 pe-sm-3 position-relative ps-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={`btn-icon rounded-circle  ${isHovered ? "img-fade" : ""}`}
        data-toggle="fullscreen"
      >
      
        <img src="/img/Profile.svg" alt="User Profile" />
        <i className="fa-duotone fa-solid fa-chevron-down" ></i>
        
       
      </button>
      
      <div className={`prfile-submenu ${isHovered ? "submenu-show" : ""}`}>
        <div className="">
          <p className="m-0 fw-light">Osman Alee</p>
          <span>Admin</span>
        </div>
        <div className="logout">
          <button>
            <span>
              <i className="fa-solid fa-power-off"></i>
            </span>{" "}
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
