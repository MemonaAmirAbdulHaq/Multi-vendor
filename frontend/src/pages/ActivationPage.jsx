import React, { useEffect, useState } from 'react'
import { server } from '../server';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
   if(activation_token){
    const activationEmail=async()=>{
      try {
        console.log("Sending activation token:", { activation_token });//extra add
        const res=await axios.post (`${server}/user/activation`,{
          activation_token,
        });
        console.log(res.data.message)

      } catch (error) {
        console.log(error.response.data.message);
        setError(true);
      }
    }
    activationEmail();
   }
  }, [activation_token])
  
  return (
    <div style={{
      width:"100%",
      height:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    }}>
      {
        error ? (
          <p>Your token is expired</p>
        ) : (
          <p>Your account has been created successfully!</p>
        )
      }
    </div>
  )
}

export default ActivationPage



