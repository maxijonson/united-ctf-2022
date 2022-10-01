import net from "net";

const URL = "nc.ctf.unitedctf.ca";

export default (
  port: number,
  onData: (data: Buffer, socket: net.Socket) => void | Promise<void>
) => {
  const socket = new net.Socket();
  socket.connect(port, URL, () => {
    console.info("Connected");
  });

  socket.on("data", (data) => {
    onData(data, socket);
  });

  socket.on("close", () => {
    console.info("Connection closed");
  });
};
