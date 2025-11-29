import jwt from "jsonwebtoken";

const SECRET = process.env.CORE_JWT_SECRET!;

export function validateToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, payload: null };
  }
}
