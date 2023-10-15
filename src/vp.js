import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/database";
import "firebase/compat/storage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1JULeCpn2bAtPZUQxgrq_xaWY-QpCiio",
  authDomain: "ootp-4cd4a.firebaseapp.com",
  projectId: "ootp-4cd4a",
  storageBucket: "ootp-4cd4a.appspot.com",
  messagingSenderId: "496535491346",
  appId: "1:496535491346:web:f0aa17e4fdab18d1fad9cb",
  measurementId: "G-XB0H99VVXG"
};
// Initialize Firebase

firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();

function Vp() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [chats, setChats] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        db.collection("chats")
          .orderBy("createdAt")
          .onSnapshot((snapshot) => {
            setChats(
              snapshot.docs.map((doc) => {
                return {
                  id: doc.id,
                  ...doc.data(),
                };
              })
            );
          });
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleSignIn = (event) => {
    event.preventDefault();
    const recaptcha = new firebase.auth.RecaptchaVerifier("recaptcha");
    firebase
      .auth()
      .signInWithPhoneNumber(phone, recaptcha)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        alert("OTP sent");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleOtp = (event) => {
    event.preventDefault();
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      otp
    );
    firebase
      .auth()
      .signInWithCredential(credential)
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleSignOut = (event) => {
    event.preventDefault();
    firebase.auth().signOut();
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleTextSubmit = (event) => {
    event.preventDefault();
    db.collection("chats").add({
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: user.uid,
    });
    setText("");
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div id="recaptcha"></div>
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label>Enter your phone number</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send OTP
              </button>
            </form>
            <form onSubmit={handleOtp}>
              <div className="form-group mt-3">
                <label>Enter OTP</label>
                <input
                  type="text"
                  className="form-control"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Verify OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-end">
        <div className="col-md-2">
          <button className="btn btn-danger" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          {chats.map((chat) => (
            <div key={chat.id} className="card mb-3">
              <div className="card-body">
                <p className="card-text">{chat.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleTextSubmit}>
            <div className="form-group">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Type a message..."
                value={text}
                onChange={handleTextChange}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Vp;




