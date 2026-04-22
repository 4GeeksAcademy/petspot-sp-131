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
import LoginPlace from "./pages/Places/LoginPlace";
import PrivatePlace from "./pages/Places/PrivatePlace";
import { Admin } from "./pages/Admin";
import { AdminList, AdminCreate, AdminEdit, AdminDelete, AdminDetail } from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { Reviews } from "./pages/Reviews/Reviews.jsx";
import { ReviewDetail } from "./pages/Reviews/ReviewDetail.jsx";
import { ReviewCreate } from "./pages/Reviews/ReviewCreate.jsx";
import { ReviewEdit } from "./pages/Reviews/ReviewEdit.jsx";
import Cities from "./pages/Cities/Cities";
import AddCity from "./pages/Cities/AddCity";
import EditCity from "./pages/Cities/EditCity";
import DeleteCity from "./pages/Cities/DeleteCity";
import CityDetail from "./pages/Cities/CityDetail";

import News from "./pages/News/News";
import AddNews from "./pages/News/AddNews";
import EditNews from "./pages/News/EditNews";
import DeleteNews from "./pages/News/DeleteNews";
import NewsDetail from "./pages/News/NewsDetail";

import Chat from "./pages/Chat/Chat";
import AddChat from "./pages/Chat/AddChat";
import EditChat from "./pages/Chat/EditChat";
import Reservations from "./pages/Reservations/Reservations";
import AddReservation from "./pages/Reservations/AddReservation";
import Favorites from "./pages/Favorites/Favorites";
import AddFavorite from "./pages/Favorites/AddFavorite";
import EditFavorite from "./pages/Favorites/EditFavorite";
import DeleteFavorite from "./pages/Favorites/DeleteFavorite";
import FavoriteDetail from "./pages/Favorites/FavoriteDetail";

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
        <Route path="login" element={<AdminLogin />} />
      </Route>

      <Route path="places" element={<Places />} />
      <Route path="places/add" element={<AddPlace />} />
      <Route path="places/edit/:id" element={<EditPlace />} />
      <Route path="places/delete/:id" element={<DeletePlace />} />
      <Route path="places/view/:id" element={<PlaceDetail />} />
      <Route path="places/login" element={<LoginPlace />} />
      <Route path="places/private" element={<PrivatePlace />} />

      <Route path="cities" element={<Cities />} />
      <Route path="cities/add" element={<AddCity />} />
      <Route path="cities/edit/:id" element={<EditCity />} />
      <Route path="cities/delete/:id" element={<DeleteCity />} />
      <Route path="cities/view/:id" element={<CityDetail />} />

      <Route path="news" element={<News />} />
      <Route path="news/add" element={<AddNews />} />
      <Route path="news/edit/:id" element={<EditNews />} />
      <Route path="news/delete/:id" element={<DeleteNews />} />
      <Route path="news/view/:id" element={<NewsDetail />} />

      <Route path="chat" element={<Chat />} />
      <Route path="chat/add" element={<AddChat />} />
      <Route path="chat/edit/:id" element={<EditChat />} />
      <Route path="reservations" element={<Reservations />} />
      <Route path="reservations/form" element={<AddReservation />} />

      <Route path="favorites" element={<Favorites />} />
      <Route path="favorites/add" element={<AddFavorite />} />
      <Route path="favorites/edit/:id" element={<EditFavorite />} />
      <Route path="favorites/delete/:id" element={<DeleteFavorite />} />
      <Route path="favorites/view/:id" element={<FavoriteDetail />} />

      <Route path="*" element={<h1>Not found!</h1>} />

      <Route path="reviews" element={<Reviews />} />
      <Route path="reviews/detail/:id" element={<ReviewDetail />} />
      <Route path="reviews/create" element={<ReviewCreate />} />
      <Route path="reviews/edit/:id" element={<ReviewEdit />} />
    </Route>
  )
);