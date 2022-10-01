// NOTE: SAME AS ROME!
import net from "net";
import chalk from "chalk";

interface Position {
  x: number;
  y: number;
}

const URL = "nc.ctf.unitedctf.ca";
const PORT = 5001;
const socket = new net.Socket();

const WALL = "#";
const EMPTY = " ";
const START = "S";
const END = "E";
const WALK = "•";

let receivedMaze = false;

const findPosition = (maze: string[][], char: string) =>
  maze.reduce(
    (acc, row, y) => {
      const x = row.indexOf(char);
      if (x !== -1) {
        return { x, y };
      }
      return acc;
    },
    { x: -1, y: -1 } as Position
  );

const findShortestPath = (
  maze: string[][],
  start: Position,
  end: Position
): Position[] => {
  const queue: Position[] = [start];
  const visited: Position[] = [];
  const paths: Position[][] = [[start]];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentPath = paths.shift()!;

    if (current.x === end.x && current.y === end.y) {
      return currentPath;
    }

    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
    ];

    for (const neighbor of neighbors) {
      if (
        maze[neighbor.y] &&
        maze[neighbor.y][neighbor.x] &&
        maze[neighbor.y][neighbor.x] !== WALL &&
        !visited.find((pos) => pos.x === neighbor.x && pos.y === neighbor.y)
      ) {
        queue.push(neighbor);
        visited.push(neighbor);
        paths.push([...currentPath, neighbor]);
      }
    }
  }

  return [];
};

socket.connect(PORT, URL, () => {
  console.info("Connected");
});

socket.on("data", (data) => {
  console.info(data.toString());

  if (receivedMaze) {
    return;
  }
  receivedMaze = true;

  // Parse the maze
  const lines = data.toString().split("\n");
  const maze = lines.map((line) => line.split(""));
  const start = findPosition(maze, START);
  const end = findPosition(maze, END);

  // Find the shortest path
  const path = findShortestPath(maze, start, end);

  // Draw the path (for the record)
  path.forEach((pos) => {
    const mpos = maze[pos.y][pos.x];
    if ([START, END].includes(mpos)) {
      return;
    }
    if (mpos !== EMPTY) {
      console.error("Invalid path");
      return;
    }
    maze[pos.y][pos.x] = WALK;
  });
  const mazeString = maze
    .map((row) => row.join(""))
    .join("\n")
    .replace(new RegExp(WALK, "g"), chalk.cyanBright(WALK));
  console.info(mazeString);

  // Send the path to the server
  let res = "";
  let pathStr = "";
  path.forEach((pos) => {
    if (pos.x === start.x && pos.y === start.y) {
      return;
    }
    if (pos.x === end.x && pos.y === end.y) {
      return;
    }
    res = `${pos.y} ${pos.x}\n`;
    pathStr += res;
  });
  res = ".\n";
  pathStr += res;
  console.info(pathStr);
  socket.write(pathStr);
});

socket.on("close", () => {
  console.info("Connection closed");
});
