import nc from "../../../utils/nc";

const nerdamer = require("nerdamer/all");

const solve = (equation: string) => {
  const result = nerdamer.solveEquations(equation, "x")[0];
  return Number(result.text());
};

nc(5000, (data, socket) => {
  const lines = data.toString().split("\n");
  const line = lines.find((line) => line.includes("Round"));
  if (!line) {
    console.info("DONE!");
    console.info(data.toString());
    return;
  }
  console.info(line);
  const equation = line.split(":")[1].trim();
  const result = solve(equation);
  console.info(result);
  socket.write(result + "\n");
});
