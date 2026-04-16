import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Demo } from "./pages/Demo";
import { Single } from "./pages/Single";
import { Admin } from "./pages/Admin";
import { AdminList, AdminCreate, AdminEdit, AdminDelete } from "./pages/Admin";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="demo" element={<Demo />} />
      <Route path="single/:theId" element={<Single />} />
      <Route path="usuario/admin" element={<Admin />}>
        <Route index element={<AdminList />} />
        <Route path="crear" element={<AdminCreate />} />
        <Route path="editar/:id" element={<AdminEdit />} />
        <Route path="eliminar/:id" element={<AdminDelete />} />
      </Route>
      <Route path="*" element={<h1>Not found!</h1>} />
    </Route>
  )
);