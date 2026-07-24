// import { create } from "domain";
import { User } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";

const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;

export const useGetMyUser = () => {
    const { getAccessTokenSilently } = useAuth0();
  
    const getMyUserRequest = async (): Promise<User> => {
      const accessToken = await getAccessTokenSilently();
  
      const response = await fetch(`${API_BASE_URL}/api/my/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
  
      return response.json();
    };
    // The hook returns an object with the following properties:
    // data: The fetched data (currentUser), which will be undefined initially and then populated with the fetched user data once the request completes successfully.
    // isLoading: A boolean indicating whether the data is currently being fetched (true) or not (false).
    // error: An error object if an error occurred during the data-fetching process, otherwise undefined
    const {
      data: currentUser,
      isLoading,
      error,
    } = useQuery("fetchCurrentUser", getMyUserRequest);
  
    if (error) {
      toast.error(error.toString());
    }
  
    return { currentUser, isLoading };
  };
  

type CreateUserRequest={

    auth0Id:string;
    email:string;
};

export const useCreateMyUser=()=>{
  // getAccessTokenSilently, which is used to fetch an access token needed for authentication when making requests to the API.
      const  {getAccessTokenSilently}=useAuth0();
    const createMyUserRequest=async(user:CreateUserRequest)=>{
        const accessToken=await getAccessTokenSilently();
        const response=await fetch(`${API_BASE_URL}/api/my/user`,{
            method:'POST',
            headers:{
                Authorization:`Bearer ${accessToken}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(user),
        });
        // console.log({body});
        
        if(!response.ok){
            throw new Error("Failed to create user");
        };
    }
    // The mutateAsync function provided by useMutation is the mechanism through which we initiate the user creation process.
    // const { mutateAsync: createUser, ... } = useMutation(createMyUserRequest);, it means that we are setting up the infrastructure to handle the asynchronous process of creating a new user via an API request.
    const{ mutateAsync:createUser,
    isLoading,
    isError,
    isSuccess,
    }=useMutation(createMyUserRequest);

    return {
        createUser,
        isLoading,isError,
        isSuccess,
    };

};
type updateMyUserRequest={
    name:string,    
    addressLine1:string,    
    city:string,    
    country:string,    

}
export const useUpdateMyUser=()=>{
    const {getAccessTokenSilently}=useAuth0();

    const updateMyUserRequest=async (formData:updateMyUserRequest)=>{
        const accessToken=await getAccessTokenSilently();
        console.log(accessToken);
        
         const response =await fetch(`${API_BASE_URL}/api/my/user`,{
            method:"PUT",
            headers:{
                Authorization:`Bearer ${accessToken}`,
                "Content-Type":"application/json",
            },
            body:JSON.stringify(formData),
         });
          
         if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error response from server:', errorResponse);
            throw new Error("Failed to update user");
        }
        
           return response.json();
    };
   const {mutateAsync:updateUser,
      isLoading,
      isSuccess,
      error,
      reset,
}=useMutation(updateMyUserRequest)
if(isSuccess){
    toast.success("user profile updated!")
}
if(error){
    toast.error(error.toString());
    reset();
}
return {updateUser,isLoading,};
};