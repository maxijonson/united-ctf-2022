import net from "net";
import Nerdamer from "nerdamer";

const nerdamer = require("nerdamer/all");

const URL = "nc.ctf.unitedctf.ca";
const PORT = 5000;
const socket = new net.Socket();

const solve = (equation: string) => {
  const result = nerdamer.solveEquations(equation, "x")[0];
  return Number(result.text());
};

socket.connect(PORT, URL, () => {
  console.info("Connected");
});

socket.on("data", (data) => {
  const lines = data.toString().split("\n");
  const line = lines.find((line) => line.includes("Round"));
  if (!line) {
    console.info("DONE!");
    console.info(data.toString());
    socket.destroy();
    return;
  }
  console.info(line);
  const equation = line.split(":")[1].trim();
  const result = solve(equation);
  console.info(result);
  socket.write(result + "\n");
});

socket.on("close", () => {
  console.info("Connection closed");
});
