"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { signOutServerAction } from "@/lib/action/auth.action";

const Navbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(auth);

      // Call server action to clear session cookie
      await signOutServerAction();

      // Redirect to sign-in page
      router.push("/sign-in");
      router.refresh(); // Ensure client state updates
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4">
      <Link href="/" className="flex items-center gap-2" prefetch={true}>
        <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
        <h2 className="text-primary-100">Prepify</h2>
      </Link>
      <button
        onClick={handleLogout}
        className="text-primary-500 hover:text-primary-600 cursor-pointer transition-colors"
      >
        Sign Out
      </button>
    </nav>
  );
};

export default Navbar;
