import fs from "fs-extra";
import path from "path";

const ROUNDS = 42; // Solid Snake's age!
const ENCODED_PATH = path.resolve(__dirname, "rfc4648.txt");
const DECODED_PATH = path.resolve(__dirname, "decoded.txt");

// Decode file from RFC4648
export const decode = (input: string): Buffer => {
  const buffer = Buffer.from(input, "base64");
  return buffer;
};

fs.writeFileSync(DECODED_PATH, decode(fs.readFileSync(ENCODED_PATH, "utf-8")));

for (let i = 0; i < ROUNDS - 1; i++) {
  fs.writeFileSync(
    DECODED_PATH,
    decode(fs.readFileSync(DECODED_PATH, "utf-8"))
  );
}

console.info(fs.readFileSync(DECODED_PATH, "utf-8"));