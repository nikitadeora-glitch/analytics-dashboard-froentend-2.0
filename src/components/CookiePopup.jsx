import { useEffect, useState } from "react";

const CookiePopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <p>
          We use cookies to improve your experience and analyze traffic.
        </p>
        <div style={styles.buttonContainer}>
          <button onClick={handleDecline} style={styles.declineButton}>
            Decline
          </button>
          <button onClick={handleAccept} style={styles.button}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "#111",
    color: "#fff",
    padding: "15px",
    zIndex: 9999,
  },
  popup: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  button: {
    padding: "8px 16px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  declineButton: {
    padding: "8px 16px",
    background: "#f44336",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default CookiePopup;
