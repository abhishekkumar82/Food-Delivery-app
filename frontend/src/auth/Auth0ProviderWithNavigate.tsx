
// useCreateMyUser from "@/api/MyUserApi": This imports a custom hook for creating a user, possibly from a custom API.
import { useCreateMyUser } from "@/api/MyUserApi";
// AppState, Auth0Provider, and User from "@auth0/auth0-react": These imports are necessary for working with Auth0 authentication in a React application.
import { AppState, Auth0Provider, User } from "@auth0/auth0-react";
import {  useNavigate } from "react-router-dom";

type Props={
 children :React.ReactNode;
}
// Auth0ProviderWithNavigate: This is a functional React component that takes in the children prop and returns the Auth0Provider component wrapped around the childr
const Auth0ProviderWithNavigate=({children}:Props)=>{
 
         const navigate=useNavigate();
         const domain=import.meta.env.VITE_AUTH0_DOMAIN
         const clientId=import.meta.env.VITE_AUTH0_CLIENT_ID
         const redirectUri=import.meta.env.VITE_AUTH0_CALLBACK_URL
         const audience=import.meta.env.VITE_AUTH0_AUDIENCE
    
         if(!domain || !clientId || !redirectUri|| !audience){
            throw new Error ("unable to initialise auth");
         }
        //  This function is designed to handle the redirection that occurs after a successful authentication flow with Auth0.
        // The onRedirectCallback function checks if there's a property called returnTo inside the appState object. This returnTo property usually holds the URL where the user should be sent back to after they successfully finish the authentication process.
        // For example, if the user was on a particular page before initiating the authentication process, you can use appState to redirect them back to that page after authentication is completed.
        // This parameter provides information about the authenticated user.
        // After a successful authentication flow, the user parameter contains details such as the user's profile information, authentication tokens, or any additional metadata associated with the user. 
         const onRedirectCallback=(appState?:AppState,user?:User)=>{
              navigate(appState?.returnTo || "/auth-callback"); 
         };

         return (
            <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
              redirect_uri: redirectUri,
              audience,
            }}
            onRedirectCallback={onRedirectCallback}
          >
            {children}
          </Auth0Provider>
        );
         
}

export default Auth0ProviderWithNavigate;