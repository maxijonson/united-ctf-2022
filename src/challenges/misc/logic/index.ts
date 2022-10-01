import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

type Bit = 0 | 1;
type Byte = [Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit];

const ENCODED_PATH = path.join(__dirname, "flag.enc");
const encoded = fs.readFileSync(ENCODED_PATH);

const xnor = (a: Bit, b: Bit): Bit => {
  return a ^ b ? 0 : 1;
};
const xor = (a: Bit, b: Bit): Bit => {
  return a ^ b ? 1 : 0;
};
const byteToString = ([b0, b1, b2, b3, b4, b5, b6, b7]: Byte): string => {
  return [b7, b6, b5, b4, b3, b2, b1, b0]
    .join("")
    .replace(/(.{4})/g, "$1 ")
    .trim();
};
const bytesToString = (bytes: Byte[]): string => {
  return bytes.map(byteToString).join("\n");
};

const cipherBytes: Byte[] = [];
for (let byte = 0; byte < encoded.length; byte++) {
  const bits: Byte = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let bit = 0; bit < 8; bit++) {
    bits[bit] = ((encoded[byte] >> bit) & 1) as Bit;
  }

  cipherBytes.push(bits);
}

const possibleKeys: Byte[] = [];
for (let key = 0; key < 256; key++) {
  const keyBits: Byte = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let bit = 0; bit < 8; bit++) {
    keyBits[bit] = ((key >> bit) & 1) as Bit;
  }

  possibleKeys.push(keyBits);
}

for (let i = 0; i < possibleKeys.length; i++) {
  const key = possibleKeys[i];
  const plainBytes: Byte[] = cipherBytes.map((byte) => {
    const b7 = xnor(byte[6], key[6]);
    const b6 = xnor(byte[7], key[7]);
    const b5 = xnor(byte[4], key[4]);
    const b4 = xnor(byte[5], key[5]);
    const b3 = xor(xnor(byte[2], key[2]), b4);
    const b2 = xor(xnor(byte[3], key[3]), b5);
    const b1 = xor(xnor(byte[0], key[0]), b6);
    const b0 = xor(xnor(byte[1], key[1]), b7);
    return [b0, b1, b2, b3, b4, b5, b6, b7];
  });

  const plainTextBinary = bytesToString(plainBytes)
    .replace(/ /g, "")
    .replace(/\n/g, "");

  const plainText = plainTextBinary
    .match(/.{1,8}/g)!
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join("");

  if (plainText.toLowerCase().includes("flag")) {
    console.info(chalk`Found flag with key {green ${byteToString(key)}}`);
    console.info(plainText);
    break;
  }
}
