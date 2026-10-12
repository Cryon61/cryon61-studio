import bcrypt from "bcryptjs";

const COST = 12;
export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
/** Compared against when the user does not exist, to blunt timing-based enumeration. */
export const dummyHash = () => bcrypt.hashSync("not-a-real-password", COST);
let _dummy: string | null = null;
export const getDummyHash = () => (_dummy ??= dummyHash());
