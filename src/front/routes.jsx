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

import { User } from "./pages/User";
import { UserCreate } from "./pages/UserCreate";
import { UserEdit } from "./pages/UserEdit";
import { UserDetail } from "./pages/UserDetail";

import { Admin, AdminList, AdminCreate, AdminEdit, AdminDelete } from "./pages/Admin";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route index element={<Home />} />
      <Route path="demo" element={<Demo />} />
      <Route path="single/:theId" element={<Single />} />

      <Route path="user" element={<User />} />
      <Route path="user/create" element={<UserCreate />} />
      <Route path="user/edit/:id" element={<UserEdit />} />
      <Route path="user/detail/:id" element={<UserDetail />} />

      <Route path="usuario/admin" element={<Admin />}>
        <Route index element={<AdminList />} />
        <Route path="crear" element={<AdminCreate />} />
        <Route path="editar/:id" element={<AdminEdit />} />
        <Route path="eliminar/:id" element={<AdminDelete />} />
      </Route>
    </Route>
  )
);