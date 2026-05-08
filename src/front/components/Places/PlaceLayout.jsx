import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import PlaceSidebar from "./PlaceSidebar";
import PlaceTopbar from "./PlaceTopbar";
import "../../styles/jairo.css/admin.css/index.css";
import "../../styles/jairo.css/private-layout.css";

export default function PlaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="pvt-root">
      <div className="pvt-topbar-wrapper">
        <PlaceTopbar onToggleSidebar={openSidebar} />
      </div>

      <div className="pvt-body">
        <div className={`pvt-sidebar-wrapper${sidebarOpen ? " pvt-sidebar-wrapper--open" : ""}`}>
          <PlaceSidebar onClose={closeSidebar} />
        </div>

        {sidebarOpen && (
          <div
            className="pvt-backdrop pvt-backdrop--visible"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        <main className="pvt-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
