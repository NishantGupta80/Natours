/* eslint-disabled */


import axios from 'axios';
import {showAlert} from './alert';


 export const login = async (email,password) => {
    try{
        const res =  await axios({
            method:'POST',
            url: "/api/v1/users/login",
            data : {
                email : email,
                password : password
            }
        })
        if(res.data.status == 'Success')
        {
            showAlert("success","LogIn Successfull");
            window.setTimeout(()=>{
                location.assign('/');
            },1500)
        }
        console.log(res.data);
    }catch(err)
    {
        showAlert("error",err.response.data.message)
        console.log(err);
    } 
}

export const logout = async () =>{
        const res =  await axios({
            method:'GET',
            url: "/api/v1/users/logout",
        })
        if(res.data.status == 'success') location.reload(true);
  

}