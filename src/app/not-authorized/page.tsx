import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function NotAuthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          You must be logged in to access this page
        </h1>
        <p className="text-zinc-500 text-sm">
          Please sign in to continue to the dashboard.
        </p>
      </div>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button>Sign in</Button>
      </SignInButton>
    </div>
  );
}
