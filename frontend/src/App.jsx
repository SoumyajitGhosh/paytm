import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SignUp } from "./pages/SignUp";
import { SignIn } from "./pages/SignIn";
import { Dashboard } from "./pages/Dashboard";
import { SendMoney } from "./pages/SendMoney";

function App() {
  const allRoutes = [
    { path: "/signup", element: <SignUp /> },
    { path: "/signin", element: <SignIn /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/send", element: <SendMoney /> },
  ];

  return (
    <>
      <BrowserRouter>
        <Routes>
          {allRoutes.map((route, id) => (
            <Route key={id} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
