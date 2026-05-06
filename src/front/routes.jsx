import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import Home from "./pages/Home.jsx";
import Home2 from "./pages/Home2.jsx";
import About from "./pages/About.jsx";
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
import PlaceDashboard from "./pages/Places/PlaceDashboard";
import SignupPlace from "./pages/Places/SignupPlace";
import EditPrivatePlace from "./pages/Places/EditPrivatePlace";
import PlaceChats from "./pages/Places/PlaceChats";
import RequirePlace from "./components/RequirePlace";

import { Admin } from "./pages/Admin";
import { AdminList, AdminCreate, AdminEdit, AdminDelete, AdminDetail } from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./components/Admin/AdminLayout";

import { Reviews } from "./pages/Reviews/Reviews.jsx";
import { ReviewDetail } from "./pages/Reviews/ReviewDetail.jsx";
import { ReviewCreate } from "./pages/Reviews/ReviewCreate.jsx";
import { ReviewEdit } from "./pages/Reviews/ReviewEdit.jsx";

import Cities from "./pages/Cities/Cities";
import AddCity from "./pages/Cities/AddCity";
import EditCity from "./pages/Cities/EditCity";
import DeleteCity from "./pages/Cities/DeleteCity";
import CityDetail from "./pages/Cities/CityDetail";

import AdminPets from "./pages/Pets/AdminPets";

import Reservations from "./pages/Reservations/Reservations";
import AddReservation from "./pages/Reservations/AddReservation";
import EditReservation from "./pages/Reservations/EditReservation";
import DeleteReservation from "./pages/Reservations/DeleteReservation";
import ReservationDetail from "./pages/Reservations/ReservationDetail";

import News from "./pages/News/News";
import AddNews from "./pages/News/AddNews";
import EditNews from "./pages/News/EditNews";
import DeleteNews from "./pages/News/DeleteNews";
import NewsDetail from "./pages/News/NewsDetail";

import Chat from "./pages/Chat/Chat";
import AddChat from "./pages/Chat/AddChat";
import EditChat from "./pages/Chat/EditChat";

import Favorites from "./pages/Favorites/Favorites";
import AddFavorite from "./pages/Favorites/AddFavorite";
import EditFavorite from "./pages/Favorites/EditFavorite";
import DeleteFavorite from "./pages/Favorites/DeleteFavorite";
import FavoriteDetail from "./pages/Favorites/FavoriteDetail";

import { SignupUser } from "./pages/SignupUser";
import UserLogin from "./pages/UserPrivate/UserLogin.jsx";
import UserLayout from "./pages/UserPrivate/UserLayout.jsx";
import UserDashboard from "./pages/UserPrivate/UserDashboard.jsx";
import UserChats from "./pages/UserPrivate/UserChats/UserChats.jsx";
import UserFavorites from "./pages/UserPrivate/UserFavorites/UserFavorites.jsx";
import UserNews from "./pages/UserPrivate/UserNews/UserNews.jsx";
import UserProfile from "./pages/UserPrivate/UserProfile/UserProfile.jsx";
import UserDeleteProfile from "./components/UserPrivate/UserProfile/UserDeleteProfile.jsx";
import UserEditProfile from "./components/UserPrivate/UserProfile/UserEditProfile.jsx";
import UserReservations from "./pages/UserPrivate/UserReservations/UserReservations.jsx";
import UserAddReservationForm from "./components/UserPrivate/UserReservations/UserAddReservationForm.jsx";
import UserReviews from "./pages/UserPrivate/UserReviews/UserReviews.jsx";
import UserAddReviewForm from "./components/UserPrivate/UserReviews/UserAddReviewForm.jsx";
import RequireUserAuth from "./components/UserPrivate/RequireUserAuth.jsx";
import UserPlaceDetailCard from "./components/UserPrivate/UserPlaces/UserPlaceDetailCard.jsx";
import UserNewsDetail from "./components/UserPrivate/UserNews/UserNewsDetail.jsx";
import UserPets from "./pages/UserPrivate/UserPets/UserPets.jsx";
import UserAddPet from "./pages/UserPrivate/UserPets/UserAddPet.jsx";
import UserEditPet from "./pages/UserPrivate/UserPets/UserEditPet.jsx";
import UserDeletePet from "./pages/UserPrivate/UserPets/UserDeletePet.jsx";

import { TellMeMore } from "./pages/TellMeMore";
import PlaceMatcher from "./pages/UserPrivate/PlaceMatcher";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route index element={<Home2 />} />
      <Route path="home-v1" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="tell-me-more" element={<TellMeMore />} />
      <Route path="demo" element={<Demo />} />
      <Route path="single/:theId" element={<Single />} />

      <Route path="signup/user" element={<SignupUser />} />
      <Route path="user/login" element={<UserLogin />} />
      <Route element={<RequireUserAuth />}>
        <Route path="user/private" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="chats" element={<UserChats />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="profile/edit" element={<UserEditProfile />} />
          <Route path="profile/delete" element={<UserDeleteProfile />} />
          <Route path="favorites" element={<UserFavorites />} />
          <Route path="pets" element={<UserPets />} />
          <Route path="pets/add" element={<UserAddPet />} />
          <Route path="pets/edit/:id" element={<UserEditPet />} />
          <Route path="pets/delete/:id" element={<UserDeletePet />} />
          <Route path="reservations" element={<UserReservations />} />
          <Route path="reservations/add/:id" element={<UserAddReservationForm />} />
          <Route path="reviews" element={<UserReviews />} />
          <Route path="reviews/add/:id" element={<UserAddReviewForm />} />
          <Route path="news" element={<UserNews />} />
          <Route path="news/:id" element={<UserNewsDetail />} />
          <Route path="places/view/:id" element={<UserPlaceDetailCard />} />
          <Route path="place-matcher" element={<PlaceMatcher />} />

        </Route>
      </Route>

      <Route path="usuario/admin/login" element={<AdminLogin />} />
      <Route path="places/login" element={<LoginPlace />} />
      <Route path="places/signup" element={<SignupPlace />} />
      <Route path="places/private" element={<RequirePlace><PrivatePlace /></RequirePlace>} />
      <Route path="places/private/dashboard" element={<RequirePlace><PlaceDashboard /></RequirePlace>} />
      <Route path="places/private/edit" element={<RequirePlace><EditPrivatePlace /></RequirePlace>} />
      <Route path="places/private/chats" element={<RequirePlace><PlaceChats /></RequirePlace>} />

      <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="user" element={<User />} />
        <Route path="user/create" element={<UserCreate />} />
        <Route path="user/edit/:id" element={<UserEdit />} />
        <Route path="user/detail/:id" element={<UserDetail />} />

        <Route path="usuario/admin" element={<Admin />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="crear" element={<AdminCreate />} />
          <Route path="editar/:id" element={<AdminEdit />} />
          <Route path="eliminar/:id" element={<AdminDelete />} />
          <Route path="detalle/:id" element={<AdminDetail />} />
          <Route path="pets" element={<AdminPets />} />
          <Route path="community" element={<Chat />} />
        </Route>

        <Route path="places" element={<Places />} />
        <Route path="places/add" element={<AddPlace />} />
        <Route path="places/edit/:id" element={<EditPlace />} />
        <Route path="places/delete/:id" element={<DeletePlace />} />
        <Route path="places/view/:id" element={<PlaceDetail />} />

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

        <Route path="reservations" element={<Reservations />} />
        <Route path="reservations/form" element={<AddReservation />} />
        <Route path="reservations/edit/:id" element={<EditReservation />} />
        <Route path="reservations/delete/:id" element={<DeleteReservation />} />
        <Route path="reservations/view/:id" element={<ReservationDetail />} />

        <Route path="favorites" element={<Favorites />} />
        <Route path="favorites/add" element={<AddFavorite />} />
        <Route path="favorites/edit/:id" element={<EditFavorite />} />
        <Route path="favorites/delete/:id" element={<DeleteFavorite />} />
        <Route path="favorites/view/:id" element={<FavoriteDetail />} />

        <Route path="reviews" element={<Reviews />} />
        <Route path="reviews/detail/:id" element={<ReviewDetail />} />
        <Route path="reviews/create" element={<ReviewCreate />} />
        <Route path="reviews/edit/:id" element={<ReviewEdit />} />
      </Route>

      <Route path="*" element={<h1>Not found!</h1>} />


    </Route>
  )
);
