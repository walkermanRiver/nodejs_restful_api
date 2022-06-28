import { readFile } from "fs/promises";

const config = JSON.parse(await readFile("./app/config/config.json"));

export default config
