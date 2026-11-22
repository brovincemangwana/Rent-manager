export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name.trim()) {
    errors.name = "Enter your name";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Enter your password";
  }
  return errors;
}

export function validateProperty({ name, address }) {
  const errors = {}

  if (!name.trim()) {
    errors.name = 'Enter a property name'
  }
  if (!address.trim()) {
    errors.address = 'Enter the property address'
  }

  return errors
}

export function validateUnit({ propertyId, name, monthlyRent }) {
  const errors = {}

  if (!propertyId) {
    errors.propertyId = 'Select a property for this unit'
  }
  if (!name.trim()) {
    errors.name = 'Enter a unit name'
  }
  if (!monthlyRent || Number(monthlyRent) <= 0) {
    errors.monthlyRent = 'Enter a monthly rent above 0'
  }

  return errors
}

export function validatePayment(amount, balance) {
  const value = Number(amount)
  if (!amount || value <= 0) return 'Enter an amount above 0'
  if (value > balance) {
    return `Amount cannot be more than the balance (KES ${balance.toLocaleString()})`
  }
  return ''
}
