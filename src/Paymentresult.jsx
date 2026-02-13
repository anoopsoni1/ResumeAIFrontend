import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CreditCard, Truck, Home } from "lucide-react";
import { useSelector } from "react-redux";

function PaymentResult() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const user = useSelector((state) => state.user.userData);

  useEffect(() => {
    const order_id = localStorage.getItem("orderId");
  const cart = localStorage.getItem("Cart") ;

    const payment = async () => {
      try {
        const res = await fetch("https://resumeaibackend-oqcl.onrender.com/api/v1/user/verifypayment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id }),
        });

        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setPaymentData(data[0]);
          setStatus(data[0].payment_status || "Unknown");
     if (data[0].payment_status?.toLowerCase() === "success") {
    
      
      const orderPayload = {
    userId: user._id , 
    items: cart ,
    totalAmount: data[0].payment_amount,
    address: localStorage.getItem("savedAddress") ,
    paymentStatus: "Success",
         };
      
 const response =  await fetch("https://resumeaibackend-oqcl.onrender.com/api/v1/user/saveorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

      console.log(response.json());
}
    //  navigate("/Order")
        } else {
          setStatus("No payment data found");
        }
      } catch (error) {
        console.error(error);
        setStatus("Error verifying payment");
      } finally {
        setLoading(false);
      }
    };

    payment();
  }, []);

  const renderValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return value ?? "N/A";
  };


   const today = new Date();

  const estimated = new Date(today);
  estimated.setDate(today.getDate() + 5);

 
  const formatted = estimated.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg text-center animate-fadeIn">
        <CreditCard className="mx-auto mb-4 text-blue-500 w-16 h-16" />
        <h2 className="text-2xl font-bold mb-2">Payment Status</h2>

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
            <p className="text-gray-500">Verifying your payment...</p>
          </div>
        ) : (
          <div>
            <p
              className={`text-xl font-semibold mb-4 ${
                status.toLowerCase() === "success"
                  ? "text-green-600"
                  : status.toLowerCase() === "failed"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {status}
            </p>

            {paymentData && (
              <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg shadow-inner">
                <p><span className="font-semibold">Order ID:</span> {renderValue(paymentData.order_id)}</p>
                <p><span className="font-semibold">Transaction ID:</span> {renderValue(paymentData.cf_payment_id)}</p>
                <p><span className="font-semibold">Bank Reference:</span> {renderValue(paymentData.bank_reference)}</p>
                <p><span className="font-semibold">Amount:</span> ₹{renderValue(paymentData.payment_amount)}</p>
                <p><span className="font-semibold">Currency:</span> {renderValue(paymentData.payment_currency)}</p>
                <p><span className="font-semibold">Payment Gateway:</span> {renderValue(paymentData.payment_gateway_details?.gateway_name)}</p>
                <p><span className="font-semibold">Payment Method:</span> {renderValue(paymentData.payment_method?.upi?.channel || paymentData.payment_method)}</p>
                <p><span className="font-semibold">Payment Time:</span> {new Date(paymentData.payment_time).toLocaleString()}</p>
                <p><span className="font-semibold">Payment Message:</span> {renderValue(paymentData.payment_message)}</p>
               
                <p><span className="font-semibold">Payment Group:</span> {renderValue(paymentData.payment_group)}</p>
         <p className="flex items-center gap-2 mt-4 text-gray-700 font-semibold">
              <Truck className="w-5 h-5 text-blue-500" /> Estimated Delivery: {formatted}
           </p>
              </div>
            )}

            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center mx-auto gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentResult;