import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import"./App.css";
import OtpInput from "otp-input-react";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "./firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";

import Confetti from "react-confetti";
import React, {  useRef, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/auth";
import "firebase/database";

const App = () => {
  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);
  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const confetiRef = useRef(null);

  useEffect(() => {
    setHeight(confetiRef.current.clientHeight);
    setWidth(confetiRef.current.clientWidth);
  }, []);

  function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
          },
          "expired-callback": () => {},
        },
        auth
      );
    }
  }

  function onSignup() {
    setLoading(true);
    onCaptchVerify();
  
    const appVerifier = window.recaptchaVerifier;
  
    const formatPh = "+" + ph;
  
    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sended successfully!");
  
        // Create new user object in Firebase with phone number
        firebase
          .database()
          .ref("users/" + formatPh)
          .set({ phoneNumber: formatPh });
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }
  
  
  
  function getUsers() {
    firebase
      .database()
      .ref("users")
      .on("value", (snapshot) => {
        const users = snapshot.val();
        const currentUser = users[ph];
  
        setCurrentUser(currentUser);
      });
  }
  
  
  
  
  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        console.log(res);
        setUser(res.user);
        setLoading(false);
  
        // Retrieve all messages from Firebase
        firebase
          .database()
          .ref("messages")
          .once("value", (snapshot) => {
            const messages = snapshot.val();
            setMessages(messages);
          });
  
        // Listen for new messages in real-time
        firebase
          .database()
          .ref("messages")
          .on("child_added", (snapshot) => {
            const newMessage = snapshot.val();
            setMessages((messages) => [...messages, newMessage]);
          });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        alert("OtP is Incorrect");
        signInWithPhoneNumber();
      });
  }









  
  function onSignup() {
    setLoading(true);
    onCaptchVerify();
  
    const appVerifier = window.recaptchaVerifier;
  
    const formatPh = "+" + ph;
  
    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sended successfully!");
  
        // Create new user object in Firebase with phone number
        firebase
          .database()
          .ref("users/" + formatPh)
          .set({ phoneNumber: formatPh });
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }
  
  

    return (
      <section className="bg-white-500 flex items-center justify-center h-screen confettie-wrap" ref={confetiRef}>
      <div>
        <Toaster toastOptions={{ duration: 4000 }}  /> 
        <div id="recaptcha-container"></div>
  
        {user ? (
          <div>
            <Confetti numberOfPieces={250} width={width} height={height} />
            <div className="alig">
              <img src="./Frame (1).png"/> 
              <h2 className="text-center text-black font-medium text-2xl ">
                Login Success 
              </h2></div></div>
        ) : (
          <div className="w-80 flex flex-col gap-4 rounded-lg p-4">
            <h1 className="text-center leading-normal text-black font-medium text-3xl mb-6">
              Welcome to <br />
            </h1>
            {showOTP ? (
              <>
                <div className=" w-fit mx-auto p-4 rounded-full">
                <img src="./Frame.png" alt=""/>
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-xl text-black text-center"
                >
                  Enter your OTP
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={false}
                  autoFocus
                  className="opt-container "
                ></OtpInput>
                <button
                  onClick={onOTPVerify}
                  className="bg-[#00B3FF] w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Verify OTP</span>
                </button>
              </>
            ) : (
              <>
                <div className="  mx-auto p-4 rounded-full  h-full justify-items-center ">
                  <img src="./Frame.png" alt=""/>
                </div>
                <label
                  htmlFor=""
                  className="font-bold text-xl text-black text-center"
                >
                  Verify your phone number
                </label>
                <PhoneInput country={"in"} value={ph} onChange={setPh} />
                <button
                  onClick={onSignup}
                  className="bg-[#00B3FF] w-40 flex gap-5 items-center justify-center  py-2.5 text-white rounded aa"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Send code via SMS</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
    </section>
  );
};

export default App;