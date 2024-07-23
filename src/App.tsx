import loadable from "@loadable/component";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Container from "./components/Container";
import ProgressLine from "./components/Loading/ProgressLine";
import { Provider } from "./context/GlobalState";
import Saved from "./pages/Saved";

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

if ("Notification" in window && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(function (swReg) {
      console.log("======> Service Worker is registered", swReg);
      console.log(
        "=======>consoling service worker",
        urlB64ToUint8Array(
          "BE3_PMZbOi8cAyZHVkNEQ4QfWMh_C_jK9wWzAGWaSvrt3cNURfkYpbuoAQ_NFC5eg6fOkCYk5miAtx0oS85TaygBBw-C7yHtYAfwUHHMD4UJA1ASDwPiXCGjFtWOznu2wZEIZuGmgt-RfZlqFnyLOuOj1jL3e7qs3wuAbmhet0WB6oBERG5cmnn2IN2VOrr6IDfMeFlPnbfy5QeEfg_D5IZ1nqacXwqD3b5LQ2iWGXn5qPU8Hk1-83O1dGTuLABhjaL18BDJaEIQxolpNE3E55NUSYaQPvXQ3xL7zSxRAh-ht4Z8F3sQsOc_KvrexPdhqLRzlJaVNJ9nsNvT15HY6doxzPlo"
        )
      );
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          console.log("Notification permission granted.");
          subscribeUserToPush(swReg);
        }
      });
    })
    .catch(function (error) {
      console.error("Service Worker Error", error);
    });
}

function urlB64ToUint8Array(base64String: any) {
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

function subscribeUserToPush(swReg: any) {
  const applicationServerKey = urlB64ToUint8Array(
    "BE3_PMZbOi8cAyZHVkNEQ4QfWMh_C_jK9wWzAGWaSvrt3cNURfkYpbuoAQ_NFC5eg6fOkCYk5miAtx0oS85TaygBBw-C7yHtYAfwUHHMD4UJA1ASDwPiXCGjFtWOznu2wZEIZuGmgt-RfZlqFnyLOuOj1jL3e7qs3wuAbmhet0WB6oBERG5cmnn2IN2VOrr6IDfMeFlPnbfy5QeEfg_D5IZ1nqacXwqD3b5LQ2iWGXn5qPU8Hk1-83O1dGTuLABhjaL18BDJaEIQxolpNE3E55NUSYaQPvXQ3xL7zSxRAh-ht4Z8F3sQsOc_KvrexPdhqLRzlJaVNJ9nsNvT15HY6doxzPlo"
  );
  swReg.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription: any) {
      console.log("User is subscribed:", subscription);

      // Send subscription to your server
      sendSubscriptionToServer(subscription);
    })
    .catch(function (error: any) {
      console.error("Failed to subscribe the user: ", error);
    });
}

function sendSubscriptionToServer(subscription: any) {
  // Add user identification data (e.g., user ID or email)
  const userSubscription = {
    userId: JSON.parse(localStorage.getItem("insights-profile-id") || ""),
    subscription: subscription,
  };
  const payload = {
    title: "Hello!",
    body: "You have a new notification.",
    icon: "",
  };
  fetch("http://127.0.0.1:8000/send_notification", {
    method: "POST",
    body: JSON.stringify({
      userId: userSubscription.userId,
      payload,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return fetch("http://127.0.0.1:8000/subscribe", {
    method: "POST",
    body: JSON.stringify(userSubscription),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const App = () => {
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
