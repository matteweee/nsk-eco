import React from "react";

export default function Modal({ plotUrl, onClose }) {
  if (!plotUrl) return null; // без этого картинка может не отрендериться

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "90%",
          maxHeight: "90%",
          overflow: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <img
          src={plotUrl}
          alt="График"
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
            marginTop: "40px",
          }}
        />
      </div>
    </div>
  );
}
