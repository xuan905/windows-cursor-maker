import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import { encodeAni } from "./client/src/lib/ani.ts";

const frames = [];
for (let i = 1; i <= 5; i++) frames.push(new Uint8Array(await readFile(`/home/ubuntu/single_ani_artifact/frame-${i}.cur`)));
const ani = encodeAni(frames, 8);
await writeFile("/home/ubuntu/single_ani_artifact/-1.ani", ani);
const zip = new JSZip(); zip.file("-1.ani", ani);
const zipped = await zip.generateAsync({ type: "nodebuffer" });
await writeFile("/home/ubuntu/single_ani_artifact/animated-cursor-1.zip", zipped);
console.log(JSON.stringify({ aniBytes: ani.length, zipBytes: zipped.length, frameCount: frames.length, entries: ["-1.ani"] }, null, 2));
