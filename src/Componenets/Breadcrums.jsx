import React from "react";
import { NavLink } from "react-router-dom";
const Breadcrums = ({name}) => {
  return (
    <div
      className="breadcrums"
      style={{ fontSize: `19px`, fontWeight: `600`, color: `black` }}
    >
      <NavLink className="" to="/" style={{ color: `black` }}>
        <span>Dashboard </span>
      </NavLink>
      <span>/ </span>
      <NavLink className="" to='' style={{ color: `black` }}>
        <span>{name} </span>
      </NavLink>
     
    </div>
  );
};
export default Breadcrums;
