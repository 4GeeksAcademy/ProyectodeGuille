// Import necessary components and functions from react-router-dom.
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";

// Importar componentes del ecommerce
import ProductCatalog from "./pages/ProductCatalog";
import QuoteHistory from "./pages/QuoteHistory";
import BusinessDashboard from "./pages/BusinessDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Configurator from "./components/CustomerPortal/Configurator";
import LoginPortal from "./components/DualAccess/LoginPortal";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />

      {/* Nuevas rutas del ecommerce dentro del Layout */}
      <Route path="/products" element={<ProductCatalog />} />
      <Route path="/products/:productId" element={<Configurator />} />
      <Route path="/quote-history" element={<QuoteHistory />} />
      <Route path="/business" element={<BusinessDashboard />} />
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/login" element={<LoginPortal />} />
    </Route>
  )
);