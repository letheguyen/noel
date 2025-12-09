"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authAPI, membersAPI } from "@/lib/api-client";
import styles from "./page.module.css";

export default function Home() {
  const [uuid, setUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = Cookies.get("token");
    const member = Cookies.get("member");

    if (token && member) {
      // Check member status and redirect accordingly
      membersAPI
        .getMemberInfo()
        .then((memberInfo) => {
          // If user is admin, redirect to members page
          if (memberInfo.IsAdmin) {
            router.push("/members");
            return;
          }
          redirectBasedOnStatus(memberInfo.Status, memberInfo.ResultId);
        })
        .catch(() => {
          // If token is invalid, clear cookies
          Cookies.remove("token");
          Cookies.remove("member");
        });
    }
  }, []);

  const redirectBasedOnStatus = (status: string, resultId?: string) => {
    // If member has ResultId, always redirect to result page
    if (resultId) {
      router.push("/result");
      return;
    }

    switch (status) {
      case "PENDING":
      case "CHOSEN":
        router.push("/program-selection");
        break;
      case "TODO":
        router.push("/task-detail");
        break;
      case "DONE":
        router.push("/task-detail");
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(uuid);

      // Store token and member info
      Cookies.set("token", response.access_token, { expires: 1 }); // 1 day
      Cookies.set("member", JSON.stringify(response.member), { expires: 1 });

      window.location.reload();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.wrapperTitle}>
          🎄
          <h1 className={styles.title}>Noel Game</h1>
        </div>

        <p className={styles.subtitle}>Enter your UUID to begin</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              id="uuid"
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="UUID"
              required
              disabled={loading}
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading || !uuid}
            className={styles.button}
          >
            {loading ? "Signing in…" : "Start Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
