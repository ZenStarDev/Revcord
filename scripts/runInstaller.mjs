/*
 * Revcord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./checkNodeVersion.js";

import { execFileSync, execSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { fileURLToPath } from "url";

const isWindows = process.platform === "win32";

function isElevated() {
    if (!isWindows) return true;
    try {
        execSync("net session", { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

if (isWindows && !isElevated()) {
    console.log("Restarting with Administrator privileges...");
    const scriptPath = fileURLToPath(import.meta.url);
    const args = process.argv.slice(2).map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ");
    const cmd = `Start-Process -FilePath 'node' -ArgumentList '${scriptPath} ${args}' -Verb RunAs -Wait`;
    execSync("powershell.exe", ["-Command", cmd], { stdio: "inherit" });
    process.exit(0);
}

const BASE_URL = "https://github.com/ZenStarDev/Revcord/releases/latest/download/";
const INSTALLER_PATH_DARWIN = "RevcordInstaller.app/Contents/MacOS/RevcordInstaller";

const BASE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE_DIR = join(BASE_DIR, "dist", "Installer");
const ETAG_FILE = join(FILE_DIR, "etag.txt");

function getFilename() {
    switch (process.platform) {
        case "win32":
            return "RevcordInstallerCli.exe";
        case "darwin":
            return "RevcordInstaller.MacOS.zip";
        case "linux":
            return "RevcordInstallerCli-linux";
        default:
            throw new Error("Unsupported platform: " + process.platform);
    }
}

async function ensureBinary() {
    const filename = getFilename();
    console.log("Downloading " + filename);

    mkdirSync(FILE_DIR, { recursive: true });

    const downloadName = join(FILE_DIR, filename);
    const outputFile = process.platform === "darwin"
        ? join(FILE_DIR, "RevcordInstaller")
        : downloadName;

    const localFallback = process.platform === "win32"
        ? join(BASE_DIR, "Installer", "RevcordInstallerCli.exe")
        : null;

    const etag = existsSync(outputFile) && existsSync(ETAG_FILE)
        ? readFileSync(ETAG_FILE, "utf-8")
        : null;

    let downloaded = false;

    try {
        const res = await fetch(BASE_URL + filename, {
            headers: {
                "User-Agent": "Revcord (https://github.com/Revcord/Installer)",
                "If-None-Match": etag
            }
        });

        if (res.status === 304) {
            console.log("Up to date, not redownloading!");
            downloaded = true;
        } else if (res.ok) {
            writeFileSync(ETAG_FILE, res.headers.get("etag"));

            if (process.platform === "darwin") {
                console.log("Unzipping...");
                const zip = new Uint8Array(await res.arrayBuffer());

                const ff = await import("fflate");
                const bytes = ff.unzipSync(zip, {
                    filter: f => f.name === INSTALLER_PATH_DARWIN
                })[INSTALLER_PATH_DARWIN];

                writeFileSync(outputFile, bytes, { mode: 0o755 });

                console.log("Overriding security policy for installer binary (this is required to run it)");
                console.log("xattr might error, that's okay");

                const logAndRun = cmd => {
                    console.log("Running", cmd);
                    try {
                        execSync(cmd);
                    } catch { }
                };
                logAndRun(`sudo spctl --add '${outputFile}' --label "Revcord Installer"`);
                logAndRun(`sudo xattr -d com.apple.quarantine '${outputFile}'`);
            } else {
                const body = Readable.fromWeb(res.body);
                await finished(body.pipe(createWriteStream(outputFile, {
                    mode: 0o755,
                    autoClose: true
                })));
            }

            console.log("Finished downloading!");
            downloaded = true;
        } else {
            console.warn(`Download failed with status ${res.status}, trying local build...`);
        }
    } catch (e) {
        console.warn("Download failed:", e.message, "- trying local build...");
    }

    if (!downloaded && localFallback && existsSync(localFallback)) {
        console.log("Using local installer build:", localFallback);
        return localFallback;
    }

    if (!downloaded) {
        throw new Error(`Failed to download installer and no local build found at ${localFallback || outputFile}`);
    }

    return outputFile;
}



const installerBin = await ensureBinary();

console.log("Now running Installer...");

const argStart = process.argv.indexOf("--");
const args = argStart === -1 ? [] : process.argv.slice(argStart + 1);

try {
    execFileSync(installerBin, args, {
        stdio: "inherit",
        env: {
            ...process.env,
            REVCORD_USER_DATA_DIR: BASE_DIR,
            REVCORD_DEV_INSTALL: "1"
        }
    });
} catch {
    console.error("Something went wrong. Please check the logs above.");
}
