export function validateRegister({name, email, password, confirmPassword}) {
    const errors = {};

    if (!name.trim()) {
        errors.name = "Enter your name";
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = "Enter a valid email";
    }

    if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
}
