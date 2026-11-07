import Link from "next/link";
import Logo from "@/components/ui/Logo";
import RegisterForm from "@/components/forms/RegisterForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 lg:hidden">
        <Logo />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your farmer account</h1>
      <p className="mb-8 mt-1.5 text-sm text-muted">
        Register to record your ponds, batches, feed and sales. Fisheries Officer accounts are created by an
        administrator.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-aqua-700 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}