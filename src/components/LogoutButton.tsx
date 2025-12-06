"use client";

import Cookies from "js-cookie";
import { logout } from "@/lib/auth-utils";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const token = Cookies.get("token");
  const member = Cookies.get("member");

  if (token && member) {
    const { Name, UUID } = JSON.parse(member);
    return (
      <div className={styles.logoutButton}>
        <p className={styles.useName}>{Name} ({UUID})</p>
        <p className={styles.logoutBtn} onClick={logout}>Đăng xuất</p>
      </div>
    );
  }
}
