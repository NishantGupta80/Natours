/* eslint-disable*/
import axios from 'axios';
import {showAlert} from './alert';

const stripe = Stripe('pk_test_51QP2g9GR9jNUr8SvTV1cqi5nWYfSERemx1b8Z2L6X3F0cvVp8ewk2A8nYhCFxpDtu0wpBMIS3L99fZIY7jAjnil600ycM8m5hh')

export const bookTour = async (tourId) => {
    // 1) Get checkout session from API
    try{
    const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);



 // 2) redirect to Checkout Page
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id
    })


    }catch(err){
        console.log(err);
        showAlert("error",err.response.data.message)
    }

}
