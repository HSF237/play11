import { useEffect, Component, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Footer,
  Home,
  Shop,
  ProductDetail,
  Cart,
  Checkout,
  Wishlist,
  Info,
} from "./new/Storefront.jsx";
import { StoreProvider, useStore } from "./new/core.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
const Admin = lazy(() =>
  import("./new/Admin.jsx").then((m) => ({ default: m.Admin })),
);
const AdminLogin = lazy(() =>
  import("./new/Admin.jsx").then((m) => ({ default: m.AdminLogin })),
);
class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>Let’s try that again.</h1>
        <p>The page could not load. Your saved bag is still here.</p>
        <button className="btn" onClick={() => location.reload()}>
          Reload store
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const { pathname } = useLocation(),
    { settings } = useStore(),
    admin = pathname.startsWith("/admin");
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname === "/" ? "Your club. Your colours." : pathname.split("/")[1].replaceAll("-", " ")} — PLAY11`;
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!admin && <Navbar />}
      <main id="main">
        <Suspense fallback={<div className="loading">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/story" element={<Info page="story" />} />
            <Route path="/help" element={<Info page="help" />} />
            <Route path="/policies" element={<Info page="policies" />} />
            <Route path="/my-orders" element={<Info page="orders" />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="empty">
                  <span className="eyebrow">404 / OFFSIDE</span>
                  <h1>Out of play.</h1>
                  <Link className="btn" to="/shop">
                    Back to the lineup →
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      {!admin && (
        <>
          <Footer />
          <a
            className="support-float"
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact PLAY11 on WhatsApp"
          >
            <span>↗</span>
            <b>Let’s talk football</b>
          </a>
        </>
      )}
    </>
  );
}
export default function App() {
  return (
    <Boundary>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </Boundary>
  );
}
