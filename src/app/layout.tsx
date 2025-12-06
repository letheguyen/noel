"use client";

import { useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  useEffect(() => {
    const createSnow = () => {
      const snow = document.createElement("div");
      snow.className = "snowflake";
      snow.textContent = "❄";

      snow.style.left = Math.random() * 100 + "vw";
      snow.style.fontSize = 8 + Math.random() * 14 + "px";
      snow.style.opacity = String(0.7 + Math.random() * 0.3);
      snow.style.animationDuration = 4 + Math.random() * 5 + "s";
      snow.style.setProperty("--moveX", -20 + Math.random() * 40 + "vw");

      document.body.appendChild(snow);
      setTimeout(() => snow.remove(), 60000);
    };

    const interval = setInterval(createSnow, 14000);
    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="vi">
      <body>
        <LogoutButton />
        {children}
      </body>
    </html>
  );
}
