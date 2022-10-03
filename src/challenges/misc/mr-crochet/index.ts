import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { zip } from "zip-a-folder";
import nc from "../../../utils/nc";

const REPO_PATH = path.join(__dirname, "repo");

(async () => {
  // Create a new git repo in the repo folder
  await fs.remove(REPO_PATH);
  await fs.mkdir(REPO_PATH);
  execSync("git init", { cwd: REPO_PATH });

  // Zip the repo folder
  await zip(REPO_PATH, path.join(__dirname, "repo.zip"));

  // Encode the zip file to base64
  const zipFile = await fs.readFile(path.join(__dirname, "repo.zip"));
  const zipFileBase64 = zipFile.toString("base64");

  let zipSent = false;

  nc(5003, async (data, socket) => {
    const res = data.toString();

    if (!zipSent && res.endsWith("EOF\n")) {
      socket.write(`${zipFileBase64}\nEOF\n`);
      console.info(chalk.green("Sent zip file!"));
      zipSent = true;
      return;
    }

    if (!zipSent) {
        return;
    }

    const newZipFile = Buffer.from(res, "base64");
    await fs.writeFile(path.join(__dirname, "new-repo.zip"), newZipFile);
    await fs.writeFile(path.join(__dirname, "new-repo.txt"), res);
  });
})();
