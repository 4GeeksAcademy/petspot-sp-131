import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Demo } from "./pages/Demo";
import { Single } from "./pages/Single";
import { Admin } from "./pages/Admin";
import Places from "./pages/Places/Places";
import AddPlace from "./pages/Places/AddPlace";
import EditPlace from "./pages/Places/EditPlace";
import DeletePlace from "./pages/Places/DeletePlace";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="demo" element={<Demo />} />
      <Route path="single/:theId" element={<Single />} />
      <Route path="usuario/admin" element={<Admin />} />
      <Route path="places" element={<Places />} />
      <Route path="places/add" element={<AddPlace />} />
      <Route path="places/edit/:place_id" element={<EditPlace />} />
      <Route path="places/delete/:place_id" element={<DeletePlace />} />
      <Route path="*" element={<h1>Not found!</h1>} />
    </Route>
  )
);