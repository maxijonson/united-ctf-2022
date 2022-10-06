import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import _ from "lodash";
import path from "path";
import nc from "../../../utils/nc";

const REPO_PATH = path.join(__dirname, "repo");
const ZIP_PATH = path.join(__dirname, "repo.zip");
const NEWZIP_PATH = path.join(__dirname, "new.zip");

let newZip64 = "";

(async () => {
  // Create a new git repo in the repo folder
  await fs.remove(REPO_PATH);
  await fs.mkdir(REPO_PATH);
  execSync("git init", { cwd: REPO_PATH });

  execSync("zip -r repo.zip repo", { cwd: __dirname });
  const zip = await fs.readFile(ZIP_PATH);

  let zipSent = false;
  nc(
    5003,
    async (data, socket) => {
      const res = data.toString();

      if (!zipSent && res.endsWith("EOF\n")) {
        socket.write(zip.toString("base64") + "\n");
        socket.write("EOF\n");
        zipSent = true;
        return;
      }

      if (!zipSent) {
        return;
      }

      newZip64 += res;
    },
    () => {
      // Clean up
      execSync("rm -rf repo.zip repo", { cwd: __dirname });

      // Write the new zip file
      const newZip = Buffer.from(newZip64, "base64");
      fs.writeFileSync(NEWZIP_PATH, newZip);
    }
  );
})();
