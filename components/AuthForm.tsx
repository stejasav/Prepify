"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/action/auth.action";
import FormField from "./FormField";
import { useState } from "react";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  return (
    <div
      className="lg:min-w-[566px] rounded-[32px] p-[1px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255,255,255,0.03))",
      }}
    >
      <div
        className="flex flex-col gap-8 py-14 px-10 rounded-[32px] relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
        }}
      >
        {/* Glow Effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 35%)",
          }}
        />

        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "rgba(37,99,235,0.35)",
          }}
        />

        {/* Logo */}
        <div className="flex flex-row gap-3 justify-center items-center relative z-10">
          <Image
            src="/logo.svg"
            alt="logo"
            height={40}
            width={42}
            className="object-contain"
          />

          <h2 className="text-white text-3xl font-black tracking-tight">
            PrepWise
          </h2>
        </div>

        {/* Subtitle */}
        <div className="relative z-10">
          <h3 className="text-center text-white/75 text-lg font-medium leading-relaxed">
            Practice job interviews with AI-powered feedback
          </h3>
        </div>

        {/* Demo Access */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full group relative overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 40%)",
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">

                <div className="text-left">
                  <p className="text-white font-semibold text-sm">
                    Use Demo Account
                  </p>

                  <p className="text-white/45 text-xs">
                    Click to reveal login credentials
                  </p>
                </div>
              </div>

              <div
                className={`text-white/50 text-lg transition-transform duration-300 ${
                  showDemoCredentials ? "rotate-180" : ""
                }`}
              >
                ⌄
              </div>
            </div>
          </button>

          {/* EXPANDABLE CONTENT */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              showDemoCredentials
                ? "max-h-[300px] opacity-100 mt-3"
                : "max-h-0 opacity-0"
            }`}
          >
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
              }}
            >
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Use these credentials to sign in and explore all features of the platform.
              </p>

              <div className="space-y-3">

                {/* EMAIL */}
                <div className="rounded-xl px-4 py-3 bg-black/20 border border-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">
                    Demo Email
                  </p>

                  <p className="text-blue-300 font-semibold text-sm">
                    tejas@gmail.com
                  </p>
                </div>

                {/* PASSWORD */}
                <div className="rounded-xl px-4 py-3 bg-black/20 border border-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">
                    Demo Password
                  </p>

                  <p className="text-blue-300 font-semibold text-sm">
                    tejas123
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-green-400/80">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

                <p>
                  Ready to use for testing and exploring the application
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-2 relative z-10"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button
              type="submit"
              className="
                w-full h-12 rounded-2xl
                bg-gradient-to-r from-blue-600 to-blue-500
                hover:from-blue-500 hover:to-blue-400
                text-white font-bold text-base
                border border-white/10
                shadow-[0_10px_40px_rgba(37,99,235,0.45)]
                transition-all duration-300
                hover:scale-[1.02]
                active:scale-[0.98]
                cursor-pointer
              "
            >
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm relative z-10">
          {isSignIn ? "No account yet?" : "Have an account already?"}

          <Link
            prefetch={true}
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-blue-400 ml-1 hover:text-blue-300 transition"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
