import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "../../styles/jairo.css/admin.css/index.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="admin-root">
      <div className="admin-topbar-wrapper">
        <AdminTopbar onToggleSidebar={openSidebar} />
      </div>

      <div className="admin-body">
        <div className={`admin-sidebar-wrapper${sidebarOpen ? " admin-sidebar-wrapper--open" : ""}`}>
          <AdminSidebar onClose={closeSidebar} />
        </div>

        {sidebarOpen && (
          <div
            className="admin-backdrop admin-backdrop--visible"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
