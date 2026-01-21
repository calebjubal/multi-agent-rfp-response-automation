"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail, ArrowLeft, Loader2, Lock, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requestPasswordReset, resetPassword } = useAuth();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleRequestLink = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to send reset link");
      return;
    }

    setResetUrl(result.resetUrl || "");
    setSuccess(true);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to reset password");
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg border-border">
        <CardHeader>
          <CardTitle className="text-xl">{token ? "Set a new password" : "Reset your password"}</CardTitle>
          <CardDescription>
            {token
              ? "Choose a strong password for your account."
              : "We will send a secure reset link to your registered email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              {token && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-3 py-3 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{token ? "Password updated" : "Email sent"}</p>
                  <p className="text-xs text-muted-foreground">
                    {token
                      ? "You can now sign in with your new password."
                      : "Check your inbox for the reset link. It may take a minute."}
                  </p>
                </div>
              </div>

              {!token && resetUrl && (
                <Alert className="bg-secondary/50 border-border">
                  <AlertDescription>
                    <Link href={resetUrl} className="text-primary hover:underline font-medium">
                      Open reset link
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/login")} className="w-full">
                  Back to Sign In
                </Button>
                {!token && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setResetUrl("");
                    }}
                    className="w-full"
                  >
                    Send another link
                  </Button>
                )}
              </div>
            </div>
          ) : token ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequestLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
