// src/front/routes.jsx
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { SearchResults } from "./pages/SearchResults";
import { ExperienceDetail } from "./pages/ExperienceDetail";
import { RoomDetail } from "./pages/RoomDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Confirmation } from "./pages/Confirmation";  // 👈 NUEVO

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
            {/* Main Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            
            {/* Detail Pages */}
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/room/:id" element={<RoomDetail />} />
            
            {/* Booking Flow */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation" element={<Confirmation />} />  {/* 👈 NUEVO */}
            
            {/* Other Pages */}
            <Route path="/single/:theId" element={<Single />} />
            <Route path="/demo" element={<Demo />} />
        </Route>
    ),
    {
        basename: import.meta.env.VITE_BASENAME || "",
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }
    }
);