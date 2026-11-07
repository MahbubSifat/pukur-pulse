export function validateLogin(body) {
  const errors = {};
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username) errors.username = "Enter your username";
  else if (username.length > 50) errors.username = "Username is too long";
  if (!password) errors.password = "Enter your password";
  else if (Buffer.byteLength(password) > 72) errors.password = "Password is too long";

  return { values: { username, password }, errors };
}