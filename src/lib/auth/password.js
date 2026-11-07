import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const COST = 10;

export const hashPassword = (plain) => bcrypt.hash(plain, COST);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Username না পাওয়া গেলেও একই পরিমাণ সময় খরচ করি, যাতে সময় মেপে
// "এই username আছে কিনা" বোঝা না যায়।
let dummyHash;
export async function burnTime(plain) {
  dummyHash ??= bcrypt.hash(randomBytes(16).toString("hex"), COST);
  await bcrypt.compare(plain, await dummyHash);
}