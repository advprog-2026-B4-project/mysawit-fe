"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{
        top: 18,
        right: 18,
      }}
      toastOptions={{
        duration: 4200,
        style: {
          background: "var(--surface)",
          color: "var(--text-dark)",
          border: "1px solid color-mix(in srgb, var(--sand) 58%, transparent)",
          borderRadius: "8px",
          boxShadow: "0 16px 32px rgba(26, 46, 26, 0.12)",
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          padding: "12px 14px",
          maxWidth: "420px",
        },
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "var(--cream)",
          },
          style: {
            border: "1px solid color-mix(in srgb, var(--success) 36%, transparent)",
            background: "color-mix(in srgb, var(--success) 8%, var(--surface))",
            color: "var(--success)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--error)",
            secondary: "var(--cream)",
          },
          style: {
            border: "1px solid color-mix(in srgb, var(--error) 36%, transparent)",
            background: "color-mix(in srgb, var(--error) 8%, var(--surface))",
            color: "var(--error)",
          },
        },
        loading: {
          iconTheme: {
            primary: "var(--forest)",
            secondary: "var(--cream)",
          },
          style: {
            border: "1px solid color-mix(in srgb, var(--forest) 34%, transparent)",
            background: "color-mix(in srgb, var(--forest) 7%, var(--surface))",
            color: "var(--forest)",
          },
        },
      }}
    />
  );
}
