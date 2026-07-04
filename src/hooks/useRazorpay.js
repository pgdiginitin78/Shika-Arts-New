import { useCallback, useRef } from "react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_T87yo81olrgCBZ";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.getElementById("razorpay-sdk");

    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () =>
        reject(new Error("Failed to load Razorpay SDK"));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () =>
      reject(new Error("Failed to load Razorpay SDK"));

    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const loadingRef = useRef(false);

  const openRazorpay = useCallback(
    async ({
      wooOrderId,
      razorpayOrderId,
      amount,
      currency = "INR",
      name = "Shikaarts",
      description = "",
      customerName = "",
      email = "",
      phone = "",
      onSuccess,
      onFailure,
    }) => {
      if (loadingRef.current) return;

      loadingRef.current = true;

      try {
        await loadRazorpayScript();

        const options = {
          key: RAZORPAY_KEY_ID,

          ...(razorpayOrderId ? { order_id: razorpayOrderId } : {}),

          amount,

          currency,

          name,

          description,

          prefill: {
            name: customerName,
            email,
            contact: phone,
          },

          notes: {
            woo_order_id: wooOrderId,
          },

          theme: {
            color: "#c9a84c",
          },

          modal: {
            ondismiss: () => {
              loadingRef.current = false;

              onFailure?.({
                message: "Payment cancelled by user",
              });
            },
          },

          handler: function (response) {
            loadingRef.current = false;

            onSuccess?.({
              wooOrderId,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpayOrderId:
                response.razorpay_order_id,

              razorpaySignature:
                response.razorpay_signature,
            });
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
          loadingRef.current = false;

          onFailure?.(response.error);
        });

        razorpay.open();
      } catch (err) {
        loadingRef.current = false;
        onFailure?.(err);
      }
    },
    []
  );

  return {
    openRazorpay,
  };
}