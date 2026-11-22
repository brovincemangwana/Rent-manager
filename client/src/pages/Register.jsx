import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import { registerUser, getAuthErrorMessage } from "../services/authService";
import { validateRegister } from "../utils/validate";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const found = validateRegister(form);
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await registerUser(form);
      navigate("/");
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err.code));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Register</h1>

      {submitError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Name"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <FormField
          label="Email"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Password"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <FormField
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <div className="mb-6">
          <label
            htmlFor="role"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            I am a
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
