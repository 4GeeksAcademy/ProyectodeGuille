import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import { Footer } from "../components/Footer";

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
