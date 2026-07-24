import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {z} from "zod";
// The form schema defines the structure and validation rules for the data expected from the form. In this case, it specifies the expected shape of the user profile data, including fields like email, name, addressLine1, city, and country, along with their validation rules (such as minimum length and optional fields).
// by defining a form schema, you ensure that the data submitted through the form conforms to the expected structure and satisfies the specified validation rules.

const formSchema=z.object({
    email:z.string().optional(),
    name:z.string().min(1,"name is required"),
    addressLine1:z.string().min(1,"addressLine1 is required"),
    city:z.string().min(1,"city is required"),
    country:z.string().min(1,"country is required"),
    
});
// Essentially, z.infer examines the structure of the Zod schema and extracts the TypeScript type information embedded within it. It then returns this inferred type, which can be assigned to a TypeScript type alias.
export type UserFormData=z.infer<typeof formSchema>


// currentUser: User: This property expects an object of type User, representing the current user's data. It likely includes information such as the user's email, name, address, etc.

// onSave: (userProfileData: UserFormData) => void: This property expects a function called onSave. The function should accept one parameter (userProfileData) of type UserFormData, which represents the data entered by the user in the form. The function doesn't return anything (void).

// isLoading: Boolean: This property expects a boolean value indicating whether the form is in a loading state or not
type Props={
    currentUser:User
    onSave:(userProfileData:UserFormData)=> void;
    isLoading:Boolean;
    title?:string;
    buttonText?:string;
};
  

// zodResolver is a function provided by @hookform/resolvers/zod that integrates Zod schemas with react-hook-form. It uses the formSchema defined earlier to validate the form data.

// currentUser is passed as the default values, so the form fields are pre-filled with the current user's data when the component is rendered initially.
const UserProfileForm = ({onSave,isLoading,currentUser,title="User Profile",buttonText="Submit",}:Props) => {
 const form=useForm<UserFormData>({
    resolver:zodResolver(formSchema),
    defaultValues:currentUser,
 });

useEffect(()=>{
    form.reset(currentUser);
},[currentUser,form]
)
// The onSave function receives the form data as its parameter. This form data typically includes information entered by the user, such as their email, name, address, etc.
// Inside the onSave function, you can perform various operations with the form data. For example:
// Saving the data to a database or making an API request to update the user's profile information.
// Performing additional validation or processing before saving the data.
// Updating the UI or showing a success/error message to the user based on the result of the save operation.

 return(
    <Form {...form}>
         <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 bg-gray-50 rounded-lg md:p-10">
            <div>
                <h2 className="text-2xl font-bold"> {title}</h2>
                <FormDescription>
                    view and change your profile information here 
                </FormDescription>
            </div>
            <FormField 
            control={form.control} 
            name="email" 
            render={({field})=>(
               <FormItem>
                <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input {...field} disabled className="bg-white"/>
                    </FormControl>
                
               </FormItem>
                 )}/>
                 <FormField 
            control={form.control} 
            name="name" 
            render={({field})=>(
               <FormItem>
                <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input {...field}  className="bg-white"/>
                    </FormControl>
                <FormMessage/>
               </FormItem>
                 )}/>


                 <div className="flex flex-col md:flex-row gap-4">
                 <FormField 
            control={form.control} 
            name="addressLine1" 
            render={({field})=>(
               <FormItem className="flex-1" >
                <FormLabel>AddressLine1</FormLabel>
                    <FormControl>
                        <Input {...field}  className="bg-white"/>
                    </FormControl>
                <FormMessage/>
               </FormItem>
                 )}/>

<FormField 
            control={form.control} 
            name="city" 
            render={({field})=>(
               <FormItem className="flex-1">
                <FormLabel>City</FormLabel>
                    <FormControl>
                        <Input {...field}  className="bg-white"/>
                    </FormControl>
                <FormMessage/>
               </FormItem>
                 )}/>

<FormField 
            control={form.control} 
            name="country" 
            render={({field})=>(
               <FormItem className="flex-1">
                <FormLabel>Country</FormLabel>
                    <FormControl>
                        <Input {...field}  className="bg-white"/>
                    </FormControl>
                <FormMessage/>
               </FormItem>
                 )}/>
                 </div>

                 {isLoading ?(<LoadingButton/>):(
                    <Button type="submit" className="bg-orange-500">{buttonText}</Button>
                 )}
         </form>
    </Form>
 )
}

export default UserProfileForm
