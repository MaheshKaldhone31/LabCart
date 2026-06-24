import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "/api"; 

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    loadData();

    // ✅ auto refresh orders (important UX)
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [pRes, oRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/orders`)
      ]);

      setProducts(pRes.data);
      setOrders(oRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    const res = await axios.get(`${API_BASE}/orders`);
    setOrders(res.data);
  }

  function addToCart(p) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...p, qty: 1 }];
    });

    toast.success(`${p.name} added`);
  }

  function removeOne(id) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function placeOrder() {
    if (!cart.length) return toast.warn("Cart empty");

    setPlacing(true);
    try {
      await axios.post(`${API_BASE}/orders`, {
        items: cart.map((i) => ({ id: i.id, qty: i.qty }))
      });

      setCart([]);
      await loadData();
      toast.success("Order placed ✅");
    } catch {
      toast.error("Order failed ❌");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-all">

        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow">
          <h1 className="text-xl font-bold">🛒 LabCart</h1>

          <div className="flex gap-3 items-center">
            <span className="bg-blue-500 px-3 py-1 text-white rounded">
              {cart.length} items
            </span>

            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black"
            >
              {dark ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {/* LOADING */}
        {loading ? (
          <div className="p-10 animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">

            {/* PRODUCTS */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Products</h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md 
                    transform hover:-translate-y-1 hover:shadow-2xl transition"
                  >
                    <h3 className="font-semibold">{p.name}</h3>

                    <p className="text-green-500 font-bold">
                      ₹{p.price}
                    </p>

                    <button
                      onClick={() => addToCart(p)}
                      className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r 
                      from-blue-500 to-indigo-600 text-white 
                      hover:shadow-lg active:scale-95 transition"
                    >
                      Add to Cart
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CART */}
            <div className="sticky top-4">
              <h2 className="text-lg font-semibold mb-2">Cart</h2>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">

                {cart.length === 0 ? (
                  <p className="text-gray-400">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    {cart.map((i) => (
                      <div key={i.id} className="flex justify-between mb-2">
                        <span>{i.name}</span>

                        <div className="flex gap-2">
                          <span>x{i.qty}</span>

                          <button
                            onClick={() => removeOne(i.id)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            remove
                          </button>
                        </div>
                      </div>
                    ))}

                    <hr className="my-2" />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>

                    <button
                      onClick={placeOrder}
                      disabled={placing}
                      className="mt-3 w-full py-2 bg-green-500 text-white rounded 
                      disabled:opacity-50 hover:bg-green-600 transition"
                    >
                      {placing ? "Placing..." : "Checkout"}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ORDERS */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-3">Orders</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {orders.map((o) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
              >
                <h4>Order #{o.id}</h4>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    o.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {o.status}
                </span>

                <p className="mt-2 font-bold">₹{o.total}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      <ToastContainer />
    </div>
  );
}