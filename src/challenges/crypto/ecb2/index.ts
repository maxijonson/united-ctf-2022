import _ from "lodash";
import nc from "../../../utils/nc";

const BLOCK_SIZE = 16;
const HEX_BLOCK_SIZE = BLOCK_SIZE * 2;
const GUESS_LENGTH = 1;
const EOL = "\n";
const REGISTER = "2" + EOL;
const USERNAME = "admin";
const X = "X";
const TOKEN_OFFSET = "Here's your token, use is to login: ".length;
const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";

let type: "menu" | "prompt" | "token" = "menu";
let flag = "";
let targetBlock: string | null = null;
let charIndex = 0;

const getInputReservedLength = () => {
  return USERNAME.length + flag.length;
};

const getInput = () => {
  const reservedLength = getInputReservedLength();
  const inputLength =
    Math.floor(reservedLength / BLOCK_SIZE) * BLOCK_SIZE +
    BLOCK_SIZE -
    GUESS_LENGTH;
  return `${X.repeat(inputLength - reservedLength)}${USERNAME}${flag}`;
};

const getBlocksFromToken = (tokenBase64: string) => {
  const token = Buffer.from(tokenBase64, "base64");
  const tokenHex = token.toString("hex");
  const blocks = [];
  for (let i = 0; i < tokenHex.length; i += HEX_BLOCK_SIZE) {
    blocks.push(tokenHex.slice(i, i + HEX_BLOCK_SIZE));
  }
  return blocks;
};

const printBlocks = (hexBlocks: string[]) => {
  const blockStrs = hexBlocks.map((block) => {
    return _.chunk(block.split(""), 2)
      .map((chunk) => chunk.join(""))
      .join(" ");
  });
  console.log(blockStrs.join("\n"));
};

const getTargetBlock = (tokenBlocks: string[]) => {
  const reservedLength = getInputReservedLength();
  const targetBlock = Math.floor(reservedLength / BLOCK_SIZE);
  return tokenBlocks[targetBlock];
};

/**
 * 1 . xxxx xxxx xxad min?
 * 2 . xxxx xxxx xadm in??
 * 3 . xxxx xxxx admi n???
 * 4 . xxxx xxxa dmin ????
 * 5 . xxxx xxad min? ????
 * 6 . xxxx xadm in?? ????
 * 7 . xxxx admi n??? ????
 * 8 . xxxa dmin ???? ????
 * 9 . xxad min? ???? ????
 * 10. xadm in?? ???? ????
 * 11. admi n??? ???? ????
 */

const nextType = () => {
  switch (type) {
    case "menu":
      type = "prompt";
      break;
    case "prompt":
      type = "token";
      break;
    case "token":
      type = "prompt";
      break;
  }
};

nc(3000, (data, socket) => {
  switch (type) {
    case "menu":
      socket.write(REGISTER);
      break;
    case "prompt":
      if (targetBlock === null) {
        socket.write(getInput() + EOL);
      } else {
        if (charIndex === CHARS.length) {
            const logs = [
                "No more chars to guess",
                `Flag: ${flag}`,
                `Target block: ${targetBlock}`,
                `Input: ${getInput()} (${getInput().length})`,
            ]
            throw new Error(logs.join("\n"));
        }
        socket.write(getInput() + CHARS[charIndex] + EOL);
      }
      break;
    case "token":
      const token = data
        .toString()
        .split(EOL)[0]
        .substring(TOKEN_OFFSET - 1)
        .trim();
      const blocks = getBlocksFromToken(token);
      const tb = getTargetBlock(blocks);
      if (targetBlock === null) {
        targetBlock = tb;
      } else if (targetBlock === tb) {
        flag += CHARS[charIndex];
        charIndex = 0;
        targetBlock = null;
        console.info("flag:", flag);
      } else {
        charIndex++;
      }
      socket.write(REGISTER);
      break;
  }

  nextType();
});

console.log(getInput(), getInput().length);
