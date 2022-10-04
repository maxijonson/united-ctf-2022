import fs from "fs-extra";
import path from "path";

const textToHex = (text: string) => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += text.charCodeAt(i).toString(16);
  }
  return result;
};

const hexToText = (hex: string) => {
  let result = "";
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return result;
};

const hexToBigint = (hex: string) => {
  return BigInt("0x" + hex);
};

const bigintToHex = (bigint: bigint) => {
  return bigint.toString(16);
};

const solve = (cipher: string, dictionary: string[]) => {
  const words = dictionary.map((w) => hexToBigint(textToHex(w.trim())));
  const encrypted = hexToBigint(textToHex(cipher));
  const flag = words.reduce((xor, word) => xor ^ word, encrypted);
  console.log(hexToText(bigintToHex(flag)));
};

solve(
  Buffer.from("XWxPUD5HSBhAR1gHVnh9b31mNUg=", "base64").toString(),
  fs.readFileSync(path.join(__dirname, "dictionary.txt")).toString().split("\n")
);