"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Welcome back to Shiny Stone Sales OS");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-lime/15">
            <Gem className="h-6 w-6 text-brand-lime" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide">SHINY STONE</p>
            <p className="text-sm text-white/60">Sales OS</p>
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Enterprise sales automation for modern teams
          </h1>
          <p className="text-lg text-white/70">
            Connect customers, deals, emails, purchase orders, and AI-powered
            follow-ups in one unified platform.
          </p>
        </div>
        <p className="text-sm text-white/40">© 2026 Shiny Stone Sales OS</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary lg:hidden">
              <Gem className="h-6 w-6 text-brand-lime" />
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Access your sales workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  defaultValue="jeevan.elias@shinystone.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••" required />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" disabled>
                Google
              </Button>
              <Button variant="outline" type="button" disabled>
                Microsoft
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              SSO integration available in Settings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
