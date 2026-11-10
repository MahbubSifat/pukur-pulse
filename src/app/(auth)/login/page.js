import Link from "next/link";
import Logo from "@/components/ui/Logo";
import LoginForm from "@/components/forms/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 lg:hidden"><Logo /></div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="mb-8 mt-1.5 text-sm text-muted">Sign in with your email to manage your ponds, batches and sales.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-aqua-700 hover:underline">Create an account</Link>
      </p>
    </>
  );
}
