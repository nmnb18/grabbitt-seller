export const isValidPassword = (password: string) => {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=<>/{}[\]|~])[A-Za-z\d@$!%*?&#^()_\-+=<>/{}[\]|~]{8,}$/;
    return regex.test(password);
};

export const isValidEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
}

export const isValidPhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
}