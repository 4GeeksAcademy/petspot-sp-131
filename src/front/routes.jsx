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
import Places from "./pages/Places/Places";
import AddPlace from "./pages/Places/AddPlace";
import EditPlace from "./pages/Places/EditPlace";
import DeletePlace from "./pages/Places/DeletePlace";
import PlaceDetail from "./pages/Places/PlaceDetail";
import { Admin } from "./pages/Admin";
import { AdminList, AdminCreate, AdminEdit, AdminDelete, AdminDetail } from "./pages/Admin";
import Cities from "./pages/Cities/Cities";

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
        <Route path="detalle/:id" element={<AdminDetail />} />
      </Route>
      <Route path="places" element={<Places />} />
      <Route path="places/add" element={<AddPlace />} />
      <Route path="places/edit/:id" element={<EditPlace />} />
      <Route path="places/delete/:id" element={<DeletePlace />} />
      <Route path="places/view/:id" element={<PlaceDetail />} />

      <Route path="cities" element={<Cities />} />

      <Route path="*" element={<h1>Not found!</h1>} />
    </Route>
  )
);