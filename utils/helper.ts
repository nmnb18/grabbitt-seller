export const uriToBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result?.toString().split(",")[1];
      if (!base64data) reject("Failed to convert to base64");
      else resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const isValidPassword = (password: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=<>/{}[\]|~])[A-Za-z\d@$!%*?&#^()_\-+=<>/{}[\]|~]{8,}$/;
  return regex.test(password);
};

export const isValidEmail = (email: string) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

export const isValidPhone = (phone: string) => {
  return /^\d{10}$/.test(phone);
};
