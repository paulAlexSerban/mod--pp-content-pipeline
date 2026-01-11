const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotendv = require("dotenv");

// Load environment variables from .env file
dotendv.config();

function cleanRepoDir(targetDir) {
  try {
    execSync(`rm -rf ${targetDir}`, { stdio: "inherit", debug: true });
    console.log(`Cleaned existing directory: ${targetDir}`);
  } catch (error) {
    console.error("Failed to clean directory:", error.message);
    throw error;
  }
}

function clonePrivateRepo(repoUrl, targetDir, token) {
  // Insert token into URL
  const authenticatedUrl = repoUrl.replace(
    "https://github.com/",
    `https://${token}@github.com/`
  );

  try {
    execSync(`git clone ${authenticatedUrl} ${targetDir}`, {
      stdio: "inherit",
      debug: true,
    });
    console.log(`Successfully cloned to ${targetDir}`);
  } catch (error) {
    console.error("Failed to clone repository:", error.message);
    throw error;
  }
}

function removeUnnecessaryFiles(targetDir, exceptions = []) {
  const items = fs.readdirSync(targetDir);

  items.forEach((item) => {
    if (!exceptions.includes(item)) {
      const itemPath = path.join(targetDir, item);
      execSync(`rm -rf ${itemPath}`, { stdio: "inherit", debug: true });
      console.log(`Removed: ${itemPath}`);
    }
  });
}

function main() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const CONTENT_REPO_URL = process.env.CONTENT_REPO_GIT_URL;
  const TARGET_DIR = path.join(__dirname, "../content-source");

  cleanRepoDir(TARGET_DIR);
  clonePrivateRepo(CONTENT_REPO_URL, TARGET_DIR, GITHUB_TOKEN);
  removeUnnecessaryFiles(TARGET_DIR, ["assets", "content"]);
}

main();
