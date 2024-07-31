import React, { useEffect } from "react";
import loadable from "@loadable/component";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Container from "./components/Container";
import ProgressLine from "./components/Loading/ProgressLine";
import { Provider } from "./context/GlobalState";
import Saved from "./pages/Saved";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const Home = loadable(() => import("./pages/Home"), {
  fallback: <ProgressLine />,
});
const Product = loadable(() => import("./pages/Product"), {
  fallback: <ProgressLine />,
});
const SearchResults = loadable(() => import("./pages/SearchResults"), {
  fallback: <ProgressLine />,
});
const Cart = loadable(() => import("./pages/Cart"), {
  fallback: <ProgressLine />,
});
const Login = loadable(() => import("./pages/Login"), {
  fallback: <ProgressLine />,
});
const Register = loadable(() => import("./pages/Register"), {
  fallback: <ProgressLine />,
});

const firebaseConfig = {
  apiKey: "AIzaSyB6-_MaO3hpFt0tD1C5IqeLnpKWpalDTx4",
  authDomain: "nonprod-64586.firebaseapp.com",
  projectId: "nonprod-64586",
  storageBucket: "nonprod-64586.appspot.com",
  messagingSenderId: "449251706684",
  appId: "1:449251706684:web:231d21f65d2980501b4039",
  measurementId: "G-XSSJE9P2TF",
};

const App = () => {
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    if ("Notification" in window && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );

          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              console.log("Notification permission granted.");
              subscribeUserToPush(registration);
              console.log("===>register", registration);
              getToken(messaging, {
                vapidKey:
                  "BEkRVWXnOfCOQfwzfu1woNci0XWjPsc_c5YifU8buSTa8-udwV9PMGtBJLd1CT35CkHUWUM36TRWt1iUdfomIvk",
                serviceWorkerRegistration: registration,
              })
                .then((currentToken) => {
                  if (currentToken) {
                    console.log("FCM Token:", currentToken);
                    // Send the token to your server and update the UI if necessary
                    sendTokenToServer(currentToken);
                  } else {
                    console.log(
                      "No registration token available. Request permission to generate one."
                    );
                  }
                })
                .catch((err) => {
                  console.error(
                    "An error occurred while retrieving token. ",
                    err
                  );
                });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker Error", error);
        });

      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
          body: payload.notification.body,
          icon: payload.notification.icon,
        };

        new Notification(notificationTitle, notificationOptions);
      });
    }

    function urlB64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    function subscribeUserToPush(swReg) {
      const applicationServerKey = urlB64ToUint8Array(
        "BEkRVWXnOfCOQfwzfu1woNci0XWjPsc_c5YifU8buSTa8-udwV9PMGtBJLd1CT35CkHUWUM36TRWt1iUdfomIvk"
      );

      swReg.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        })
        .then((subscription) => {
          console.log("User is subscribed:", subscription);
          // Optionally, send subscription to server
          // sendSubscriptionToServer(subscription);
        })
        .catch((error) => {
          console.error("Failed to subscribe the user: ", error);
        });
    }
    function sendTokenToServer(token: any) {
      // Add user identification data (e.g., user ID or email)
      const userSubscription = {
        profile_id: JSON.parse(
          localStorage.getItem("insights-profile-id") || ""
        ),
        fcm_token: token,
        timestamp: new Date(),
        platform: "web",
        domain: window.location.hostname,
      };

      return fetch("https://dev-insights-api.rebid.co/v1/app/token", {
        method: "POST",
        body: JSON.stringify(userSubscription),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }, []);

  return (
    <Provider>
      <Router>
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<Product />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/search/:name" element={<SearchResults />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
