import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

export async function registerUser({ name, email, password, role }) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, "users", credential.user.uid), {
    name,
    email,
    role,
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;
  const userRef = doc(db, "users", user.uid);
  const snashot = await getDoc(userRef);

  if (!snashot.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "",
      email: user.email,
      role: "tenant",
      createdAt: serverTimestamp(),
    });
  }
  return user;
}

export function logoutUser() {
  return signOut(auth);
}

export function getAuthErrorMessage(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/weak-password":
      return "choose a stronger password.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before finishing.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return " Something went wrong. Please try again.";
  }
}
