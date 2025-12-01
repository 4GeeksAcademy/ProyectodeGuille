import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom"
import App from "./App.jsx"
import Home from "./pages/Home.jsx"
import ProductCatalog from "./pages/ProductCatalog.jsx"
import ProductDetail from "./pages/ProductDetail.jsx"
import Cart from "./pages/Cart.jsx"
import Checkout from "./pages/Checkout.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Profile from "./pages/Profile.jsx"
import Orders from "./pages/Orders.jsx"

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="products" element={<ProductCatalog />} />
      <Route path="products/:id" element={<ProductDetail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="profile" element={<Profile />} />
      <Route path="orders" element={<Orders />} />
    </Route>
  )
)