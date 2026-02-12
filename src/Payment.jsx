import React, { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { Loader2, CreditCard } from "lucide-react";
import { useSelector } from "react-redux";
import { FaRegHeart } from "react-icons/fa";
import { FaShoppingBag } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user.userData);


  const initiatePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/user/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 100,
          name: user.FirstName + " " + user.LastName,
          email: user.email,
        }),
      });

      
      const data = await res.json();
 
      localStorage.setItem("orderId", data.order_id);
        console.log("Order created:", data);

      const sessionId = data.payment_session_id;
      const cashfree = await load({ mode: "sandbox" });

      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
        <header className="relative">
            <nav className="pt-2 ml-5 flex justify-between">
              <div>
                <p className="text-2xl font-medium text-black">SoleMate</p>
              </div>
    
              <div className="sm:block hidden">
                <ul className="flex gap-8 mt-1 font-semibold place-items-center mr-5 text-white">
                  
                  <li className="bg-amber-100 p-3 rounded-[5px] text-black">
                    <FaRegHeart />
                  </li>
                  <Link to="/cart/:UserId" className="bg-amber-100 p-3 rounded-[5px] text-black">
                    <FaShoppingBag />
                  </Link>
    
                  {user ? (
                    <>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Logout
                    </button>
                    <Link to="/dashboard" className="bg-amber-100 p-3 rounded-[5px] text-black">
                      <FaRegUserCircle />
                    </Link>
                    </>
                  ) : (
                    <Link to="/login" className="bg-amber-100 p-3 rounded-[5px] text-black">
                      <FaRegUserCircle />
                    </Link>
                  )}
                </ul>
              </div>
    
              <div className="flex sm:hidden list-none gap-1">
                <Link className="bg-amber-100 p-3 rounded-[5px]">
                  <FaRegHeart />
                </Link>
                <Link to="/cart/:UserId" className="bg-amber-100 p-3 rounded-[5px]">
                  <FaShoppingBag />
                </Link>
    
                {user ? (
                  <>
                  <Link to="/dashboard" className="bg-amber-100 p-3 rounded-[5px]">
                    <FaRegUserCircle />
                  </Link>
                  <button
                    
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-[10px]"
                  >
                    Logout
                  </button>
                  
                  </>
                ) : (
                  <Link to="/dashboard" className="bg-amber-100 p-3 rounded-[5px]">
                    <FaRegUserCircle />
                  </Link>
                )}
              </div>
            </nav>
          </header>
  
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className=" shadow-2xl rounded-2xl p-8 w-full max-w-md transition-transform transform hover:scale-[1.01]">
        <div className="flex flex-col items-center text-center">
          <CreditCard className="w-14 h-14 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Secure Payment
          </h1>
          <p className="text-gray-500 mb-6">
            Complete your payment safely using Cashfree's secure gateway.
          </p>

          <button
            onClick={initiatePayment}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" /> Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" /> Pay ₹{100}
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4">
             Your payment is encrypted and 100% secure.
          </p>
        </div>
      </div>
    </div>
      </>
  );
};

export default Checkout;
