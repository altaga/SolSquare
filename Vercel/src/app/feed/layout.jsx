"use client";
import React from "react";

import { OwnerProvider } from "../../context/feedContext";

const Layout = ({ children }) => {
  return <OwnerProvider>{children}</OwnerProvider>;
};

export default Layout;
