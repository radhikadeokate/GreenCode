import { Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Frontend-only auth screens. No authentication backend is connected yet;
 * submitting validates input and shows a notice instead of signing in.
 */
function Shell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-4" /></div>
          <span className="text-base font-semibold tracking-tight">GreenCode</span>
        </Link>
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />Authentication backend not connected yet</p>
      </div>
    </div>
  );
}

type Field = { name: string; label: string; type: string; autoComplete: string; extra?: ReactNode };
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function AuthForm({ fields, submit, validate }: { fields: Field[]; submit: string; validate: (v: Record<string, string>) => Record<string, string> }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const errs = validate(v);
    setErrors(errs);
    setNotice(Object.keys(errs).length ? "" : "Looks good — this will work once the authentication backend is connected.");
  };
  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name} className="space-y-1.5">
          <div className="flex items-center justify-between"><Label htmlFor={f.name}>{f.label}</Label>{f.extra}</div>
          <Input id={f.name} name={f.name} type={f.type} autoComplete={f.autoComplete} aria-invalid={!!errors[f.name]} aria-describedby={errors[f.name] ? `${f.name}-err` : undefined} />
          {errors[f.name] && <p id={`${f.name}-err`} className="text-xs text-destructive">{errors[f.name]}</p>}
        </div>
      ))}
      <Button type="submit" className="w-full">{submit}</Button>
      {notice && <p role="status" className="rounded-md border border-info/30 bg-info/10 px-3 py-2 text-xs text-info">{notice}</p>}
    </form>
  );
}

const email: Field = { name: "email", label: "Email", type: "email", autoComplete: "email" };

export function SignInPage() {
  return (
    <Shell title="Sign in" subtitle="Log in to your GreenCode workspace." footer={<>No account? <Link to="/sign-up" className="font-medium text-foreground hover:underline">Create one</Link></>}>
      <AuthForm
        submit="Sign in"
        fields={[email, { name: "password", label: "Password", type: "password", autoComplete: "current-password", extra: <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link> }]}
        validate={(v) => ({ ...(!emailOk(v.email ?? "") && { email: "Enter a valid email address." }), ...(!v.password && { password: "Enter your password." }) })}
      />
    </Shell>
  );
}

export function SignUpPage() {
  return (
    <Shell title="Create your account" subtitle="Start measuring software efficiency." footer={<>Already have an account? <Link to="/sign-in" className="font-medium text-foreground hover:underline">Sign in</Link></>}>
      <AuthForm
        submit="Create account"
        fields={[{ name: "name", label: "Full name", type: "text", autoComplete: "name" }, email, { name: "password", label: "Password", type: "password", autoComplete: "new-password" }, { name: "confirm", label: "Confirm password", type: "password", autoComplete: "new-password" }]}
        validate={(v) => ({
          ...(!v.name?.trim() && { name: "Enter your name." }),
          ...(!emailOk(v.email ?? "") && { email: "Enter a valid email address." }),
          ...((v.password ?? "").length < 8 && { password: "Use at least 8 characters." }),
          ...(v.confirm !== v.password && { confirm: "Passwords do not match." }),
        })}
      />
    </Shell>
  );
}

export function ForgotPasswordPage() {
  return (
    <Shell title="Reset your password" subtitle="We'll email you a link to set a new password." footer={<Link to="/sign-in" className="font-medium text-foreground hover:underline">Back to sign in</Link>}>
      <AuthForm submit="Send reset link" fields={[email]} validate={(v): Record<string, string> => (!emailOk(v.email ?? "") ? { email: "Enter a valid email address." } : {})} />
    </Shell>
  );
}

export function ResetPasswordPage() {
  return (
    <Shell title="Set a new password" subtitle="Choose a strong password you don't use elsewhere." footer={<Link to="/sign-in" className="font-medium text-foreground hover:underline">Back to sign in</Link>}>
      <AuthForm
        submit="Update password"
        fields={[{ name: "password", label: "New password", type: "password", autoComplete: "new-password" }, { name: "confirm", label: "Confirm password", type: "password", autoComplete: "new-password" }]}
        validate={(v) => ({ ...((v.password ?? "").length < 8 && { password: "Use at least 8 characters." }), ...(v.confirm !== v.password && { confirm: "Passwords do not match." }) })}
      />
    </Shell>
  );
}
