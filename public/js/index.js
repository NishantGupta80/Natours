/*eslint-disabled*/

import '@babel/polyfill';
import {login,logout} from './login';
import {displayMap} from './mapbox';
import {updateData} from './updateSettings';
import {bookTour} from './stripe';

const mapBox = document.getElementById("map");
const loginForm = document.querySelector('.form--login');
const logoutBtn  = document.querySelector('.nav__el--logout');
const SettingsBtn = document.querySelector('.form-user-data');
const UpdatePasswordBtn = document.querySelector('.form-user-password');
const bookBtn = document.getElementById("book-tour")
console.log("Hello");


if(mapBox)
{
const locations=JSON.parse(mapBox.dataset.locations);
console.log(locations);   
displayMap(locations);
}



if(loginForm)
{
    loginForm.addEventListener("submit",(e) =>{ 
        console.log("login Clicked")
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        console.log(email,password);
        login(email,password);
    })
}

if(logoutBtn)
{
    logoutBtn.addEventListener("click",logout);
}

if(SettingsBtn)
{
    SettingsBtn.addEventListener("submit",(e) => {
        e.preventDefault();
        const form = new FormData();

        form.append("name",document.getElementById("name").value);
        form.append("email",document.getElementById("email").value);
        form.append("photo",document.getElementById("photo").files[0]);
       

        updateData(form,"data");
    });
}





if(UpdatePasswordBtn)
    {
        UpdatePasswordBtn.addEventListener("submit",async (e) => {
            e.preventDefault();

            document.querySelector(".btn--save-password").textContent = "Updating...";

            const CurrentPassword = document.getElementById('password-current').value;
            const newPassword = document.getElementById('password').value;
            const newPasswordConfirm = document.getElementById('password-confirm').value;
           
    
           
           await updateData({CurrentPassword,newPassword,newPasswordConfirm}, "password");
           document.getElementById('password-current').value = "";
           document.getElementById('password').value = "";
           document.getElementById('password-confirm').value = "";

           document.querySelector(".btn--save-password").textContent = "Save Password";

        });
    }

    if(bookBtn){
        bookBtn.addEventListener("click",(e)=>{
            console.log("Clicked on Book Tour")
            e.preventDefault();
            bookBtn.textContent = "Processing..."
            const tourId = e.target.dataset.tourId; // tour-id is automatically changed to CamelCase , when we add our custome elements to the tag it gets changed to camelcase
                  console.log(tourId);                                   // tour-id ==> tourId

               bookTour(tourId);
        })
    }
