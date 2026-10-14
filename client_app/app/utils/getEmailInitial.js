export function getEmailInitial(email) {
  if (typeof email !== "string") return "?";

  const initial = email.trim().charAt(0);
  return initial ? initial.toUpperCase() : "?";
}
