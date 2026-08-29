"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./account.module.css";

type AccountMode = "login" | "register" | "admin";

export default function AccountPage() {
  const [mode, setMode] = useState<AccountMode>("login");
  const [submitted, setSubmitted] = useState(false);
  const [adminError, setAdminError] = useState(false);
  const router = useRouter();

  function switchMode(nextMode: AccountMode) {
    setMode(nextMode);
    setSubmitted(false);
    setAdminError(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "admin") {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email");
      const password = formData.get("password");

      if (email === "admin@forma.com" && password === "admin123") {
        sessionStorage.setItem("forma-admin", "true");
        router.push("/admin");
        return;
      }

      setAdminError(true);
      return;
    }

    setSubmitted(true);
  }

  const isRegistering = mode === "register";
  const isAdmin = mode === "admin";

  return (
    <main className={styles.page}>
      <section className={styles.accountPanel} aria-label="Account access">
        <div className={styles.intro}>
          <p className={styles.mark}>F / 04</p>
          <p className={styles.eyebrow}>
            {isAdmin ? "Forma operations" : "Your Forma account"}
          </p>
          <h1 className={styles.title}>
            {isAdmin
              ? "Run the collection."
              : isRegistering
                ? "Make it yours."
                : "Welcome back."}
          </h1>
          <p className={styles.description}>
            {isAdmin
              ? "Sign in to manage products, pricing, stock details, and seasonal drops."
              : isRegistering
              ? "Save your details, track every order, and get first access to new drops."
              : "Sign in to pick up where you left off and keep your wardrobe moving."}
          </p>
          <div className={styles.introFooter}>
            <span>FORMA / EST. 2024</span>
            <Link href="/shop">Continue shopping</Link>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.modeSwitch} role="tablist" aria-label="Account mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? styles.modeActive : ""}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? styles.modeActive : ""}
              onClick={() => switchMode("register")}
            >
              Create account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isAdmin}
              className={isAdmin ? styles.modeActive : ""}
              onClick={() => switchMode("admin")}
            >
              Admin
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {isRegistering && (
              <label className={styles.field}>
                <span>Full name</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
            )}

            <label className={styles.field}>
              <span>Email address</span>
              <input type="email" name="email" autoComplete="email" required />
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
              />
            </label>

            {isAdmin && (
              <p className={styles.adminHint}>
                Demo access: admin@forma.com / admin123
              </p>
            )}

            {isRegistering ? (
              <label className={styles.checkRow}>
                <input type="checkbox" required />
                <span>I agree to the terms and privacy policy.</span>
              </label>
            ) : isAdmin ? null : (
              <button type="button" className={styles.forgotButton}>
                Forgot password?
              </button>
            )}

            <button type="submit" className={styles.submitButton}>
              {isAdmin ? "Open admin" : isRegistering ? "Create account" : "Sign in"}
              <span aria-hidden="true">&rarr;</span>
            </button>

            {adminError && (
              <p className={styles.error} role="alert">
                Incorrect admin credentials. Check the demo access details above.
              </p>
            )}

            {submitted && (
              <p className={styles.success} role="status">
                {isRegistering
                  ? "Your account is ready to be connected."
                  : "You are signed in for this demo."}
              </p>
            )}
          </form>

          <p className={styles.switchPrompt}>
            {isAdmin
              ? "Return to customer access?"
              : isRegistering
                ? "Already have an account?"
                : "New to Forma?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isAdmin ? "login" : isRegistering ? "login" : "register")}
            >
              {isAdmin ? "Sign in" : isRegistering ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
