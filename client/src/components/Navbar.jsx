import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-brand-700 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          Rent Manager
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="hover:underline">
            Log in
          </Link>
          <Link to="/register" className="hover:underline">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
