import { useAuth0 } from '@auth0/auth0-react';
// import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const {isAuthenticated,isLoading}=useAuth0();
  if(isLoading){
    return <><span className="loader"><h1>Loading...</h1></span></>;
  }
  if(isAuthenticated){
    return <Outlet/>
  }
   return <Navigate to="/" replace />
}

export default ProtectedRoute
