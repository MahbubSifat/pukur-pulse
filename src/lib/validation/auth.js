// এই file browser আর server দুই জায়গাতেই চলে: একই নিয়ম, দুই স্তরের পাহারা।
// Browser-এ দ্রুত বার্তার জন্য, server-এ আসল নিরাপত্তার জন্য।
const byteLength = (s) => new TextEncoder().encode(s).length;
const asText = (v) => (typeof v === "string" ? v.trim() : "");

export function validateLogin(body) {
  const errors = {};
  const username = asText(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username) errors.username = "Enter your username";
  else if (username.length > 50) errors.username = "Username is too long";
  if (!password) errors.password = "Enter your password";
  else if (byteLength(password) > 72) errors.password = "Password is too long";

  return { values: { username, password }, errors };
}

export function validateRegistration(body) {
  const errors = {};
  const fullName = asText(body?.fullName);
  const address = asText(body?.address);
  const username = asText(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  // ফোন: স্পেস/ড্যাশ বাদ, +880 বা 880 থাকলে 0 দিয়ে শুরু করা রূপে আনা
  let phone = asText(body?.phone).replace(/[\s-]/g, "");
  phone = phone.replace(/^\+?88(01\d{9})$/, "$1");

  if (fullName.length < 2) errors.fullName = "Enter your full name";
  else if (fullName.length > 100) errors.fullName = "Name must be 100 characters or fewer";

  if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = "Enter a valid mobile number, like 01712345678";

  if (address.length > 255) errors.address = "Address must be 255 characters or fewer";

  if (!/^[A-Za-z0-9_.]{3,30}$/.test(username)) {
    errors.username = "Use 3 to 30 letters, numbers, dots or underscores";
  }

  if (password.length < 8) errors.password = "Use at least 8 characters";
  else if (byteLength(password) > 72) errors.password = "Password is too long (72 bytes at most)";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Include at least one letter and one number";
  }

  if (!errors.password && confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

  return { values: { fullName, phone, address, username, password }, errors };
}