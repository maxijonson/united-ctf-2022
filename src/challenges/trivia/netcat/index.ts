import net from "net";

const URL = "nc.ctf.unitedctf.ca";
const PORT = 1337;
const socket = new net.Socket();

socket.connect(PORT, URL, () => {
  console.info("Connected");
});

socket.on("data", (data) => {
  console.info(data.toString());
});

socket.on("close", () => {
  console.info("Connection closed");
});
