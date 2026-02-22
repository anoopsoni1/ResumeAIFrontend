import React, { useEffect, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("solemate_pwa_dismissed");
      if (!dismissed) setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [visible]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User installed SoleMate");
    } else {
      console.log("User dismissed install");
      localStorage.setItem("solemate_pwa_dismissed", "true");
    }

    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("solemate_pwa_dismissed", "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-yellow-300 to-yellow-600 text-black px-5 py-4 rounded-3xl shadow-xl flex items-center gap-4 z-50 w-[90%] sm:w-auto sm:min-w-[400px] justify-between backdrop-blur-lg border border-yellow-200 animate-slideUp">
      <div className="flex items-center gap-3">
        <MdDownloadForOffline size={32} className="text-black" />
        <div>
          <p className="font-bold text-lg">Install SoleMate</p>
          <p className="text-sm text-black/80 font-medium">
            Get quick access to your favorite shoes anytime.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-2xl bg-black text-yellow-400 font-semibold shadow-md hover:scale-105 transition-transform"
        >
          Install
        </button>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-black/10 transition-colors"
        >
          <IoClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
