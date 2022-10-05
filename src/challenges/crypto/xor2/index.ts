import fs from "fs-extra";
import _ from "lodash";
import path from "path";

const base64ToText = (base64: string) =>
  Buffer.from(base64, "base64").toString();

const textToHex = (text: string) =>
  text
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

const hexToText = (hex: string) =>
  hex
    .match(/.{1,2}/g)!
    .map((c) => String.fromCharCode(Number(`0x${c}`)))
    .join("");

const hexToBigint = (hex: string) => BigInt(`0x${hex}`);

const bigintToHex = (bigint: bigint) => bigint.toString(16);

const dictionary = fs
  .readFileSync(path.join(__dirname, "dictionary.txt"))
  .toString()
  .split("\n")
  .map((w) => hexToBigint(textToHex(w.trim())));
const encryptedFlag = hexToBigint(
  textToHex(base64ToText("XWxPUD5HSBhAR1gHVnh9b31mNUg="))
);

const flag = _.shuffle(dictionary).reduce((acc, word) => acc ^ word, encryptedFlag);

console.log(hexToText(bigintToHex(flag)));
