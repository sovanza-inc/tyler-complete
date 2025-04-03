import React from "react";
import { useState, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./layouts/layout";
import Contracts from "./pages/Contracts"
import Estimate from "./pages/Estimate";
import Settings from "./pages/Settings";
import Threshold from "./pages/Threshold"
import Blueprint from "./pages/Blueprint";
import Payment from "./pages/Payment"; 
import Profile from "./pages/Profile"; 
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgetPassword from "./pages/ForgetPassword";
import Loader from "./Componenets/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from './components/ErrorBoundary';
import './assets/css/error.css';
import './App.css';
// Auth check function
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && user.id;
};

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgetPassword/>
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Dashboard/>,
      },
      {
        path:"/Blueprint",
        element:<Blueprint/>,
      },
      {
        path:"/Payment",
        element: <Payment/>,
      },
      {
        path:"/Contract",
        element:<Contracts/>
      },
      {
        path:"/Estimate",
        element: <Estimate/>
      },
      {
        path:"/Settings",
        element: <Settings/>
      },
      { 
        path:"/Threshold",
        element: <Threshold/>
      },
      {
        path:"/Profile",
        element: <Profile/>,
      }
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
