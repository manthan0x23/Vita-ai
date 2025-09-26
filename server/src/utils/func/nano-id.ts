import { nanoid } from "nanoid";

export function NanoId(len: number = 6) {
  return nanoid(len);
}
