

import { useGetMyUser, useUpdateMyUser } from "@/api/MyUserApi"
import UserProfileForm from "@/forms/user-profile-form/UserProfileForm"

const UserProfilePage = () => {
  
    const {updateUser,isLoading:isGetLoading}=useUpdateMyUser();
    const {currentUser,isLoading:isUpdateLoading}=useGetMyUser();

   if(isGetLoading){
    return <span>Loading...</span>
   }
   if(!currentUser){
    return <span>Unable to load user progile</span>
   }
  return  <UserProfileForm currentUser={currentUser} onSave={updateUser} isLoading={isUpdateLoading}/>; 
}

export default UserProfilePage
