"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiLogin, apiRegister } from "../lib/api";
import styles from "./account.module.css";

type AccountMode = "login" | "register" | "admin";

export default function AccountPage() {
  const [mode, setMode] = useState<AccountMode>("login");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  function switchMode(nextMode: AccountMode) {
    setMode(nextMode);
    setSubmittedMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedMessage("");
    setErrorMessage("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (mode === "admin") {
        const user = await apiLogin({ email, password, role: "admin" });
        sessionStorage.setItem("forma-admin", "true");
        sessionStorage.setItem("forma-user", JSON.stringify(user));
        router.push("/admin");
        return;
      }

      if (mode === "register") {
        const user = await apiRegister({ name, email, password });
        sessionStorage.setItem("forma-user", JSON.stringify(user));
        setSubmittedMessage(`Welcome, ${user.name}! Your account has been created.`);
      } else {
        const user = await apiLogin({ email, password });
        sessionStorage.setItem("forma-user", JSON.stringify(user));
        if (user.role === "admin") {
          sessionStorage.setItem("forma-admin", "true");
          router.push("/admin");
          return;
        }
        setSubmittedMessage(`Signed in as ${user.name || user.email}.`);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const isRegistering = mode === "register";
  const isAdmin = mode === "admin";
  const modes: AccountMode[] = ["login", "register", "admin"];

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentIndex = modes.indexOf(mode);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextMode = modes[(currentIndex + offset + modes.length) % modes.length];
    switchMode(nextMode);
    document.getElementById(`${nextMode}-tab`)?.focus();
  }

  return (
    <main className={styles.page}>
      <section className={styles.accountPanel} aria-label="Account access">
        <div className={styles.intro}>
          <div className={styles.leafImage} aria-hidden="true" />
          <div className={styles.introOverlay} aria-hidden="true" />
          <div className={styles.introTop}>
            <p className={styles.mark}>F / 04</p>
            <span className={styles.interactiveLabel}>INTERACTIVE SWITCH</span>
          </div>
          <div key={mode} className={`${styles.introContent} ${styles.viewContent} ${styles.activeState}`}>
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
          </div>
          <div className={styles.introFooter}>
            <span>FORMA / EST. 2024</span>
            <Link href="/shop" className={styles.continueLink}>Continue shopping</Link>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div
            className={styles.modeSwitch}
            role="tablist"
            aria-label="Account mode"
            onKeyDown={handleTabKeyDown}
          >
            <button
              type="button"
              role="tab"
              id="login-tab"
              aria-controls="login-panel"
              aria-selected={mode === "login"}
              className={mode === "login" ? styles.modeActive : ""}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              id="register-tab"
              aria-controls="register-panel"
              aria-selected={mode === "register"}
              className={mode === "register" ? styles.modeActive : ""}
              onClick={() => switchMode("register")}
            >
              Create account
            </button>
            <button
              type="button"
              role="tab"
              id="admin-tab"
              aria-controls="admin-panel"
              aria-selected={isAdmin}
              className={isAdmin ? styles.modeActive : ""}
              onClick={() => switchMode("admin")}
            >
              Admin
            </button>
          </div>

          <div className={styles.panelContent}>
            <div
              id="login-panel"
              role="tabpanel"
              aria-labelledby="login-tab"
              className={`${styles.viewPanel} ${mode === "login" ? styles.activeState : styles.hiddenState}`}
              hidden={mode !== "login"}
            >
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span>Email address</span>
                  <input type="email" name="email" autoComplete="email" placeholder="name@domain.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className={styles.field}>
                  <span>Password</span>
                  <input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
                <button type="button" className={styles.forgotButton}>Forgot password?</button>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  <span>{submitting ? "Connecting..." : "Sign in"}</span>
                  <span className={styles.arrowIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
                </button>
              </form>
            </div>

            <div
              id="register-panel"
              role="tabpanel"
              aria-labelledby="register-tab"
              className={`${styles.viewPanel} ${mode === "register" ? styles.activeState : styles.hiddenState}`}
              hidden={mode !== "register"}
            >
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span>Full name</span>
                  <input type="text" name="name" autoComplete="name" placeholder="Your full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                </label>
                <label className={styles.field}>
                  <span>Email address</span>
                  <input type="email" name="email" autoComplete="email" placeholder="name@domain.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className={styles.field}>
                  <span>Password</span>
                  <input type="password" name="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required />
                  <span>I agree to the terms and privacy policy.</span>
                </label>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  <span>{submitting ? "Connecting..." : "Create account"}</span>
                  <span className={styles.arrowIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
                </button>
              </form>
            </div>

            <div
              id="admin-panel"
              role="tabpanel"
              aria-labelledby="admin-tab"
              className={`${styles.viewPanel} ${mode === "admin" ? styles.activeState : styles.hiddenState}`}
              hidden={mode !== "admin"}
            >
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span>Email address</span>
                  <input type="email" name="email" autoComplete="email" placeholder="name@domain.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className={styles.field}>
                  <span>Password</span>
                  <input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
                <div className={styles.adminHint}>
                  <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                  <span>Demo access: admin@forma.com / admin123</span>
                  <button type="button" onClick={() => { setEmail("admin@forma.com"); setPassword("admin123"); }}>FILL</button>
                </div>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  <span>{submitting ? "Connecting..." : "Open admin"}</span>
                  <span className={styles.arrowIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
                </button>
              </form>
            </div>

            {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
            {submittedMessage && <p className={styles.success} role="status">{submittedMessage}</p>}
          </div>

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
