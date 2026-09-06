import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
assert.match(pkg.name, /^n8n-nodes-/);
assert.ok(pkg.keywords.includes("n8n-community-node-package"));
assert.deepEqual(pkg.dependencies, {}, "verified community-node candidate must have zero runtime dependencies");
assert.deepEqual(pkg.n8n.credentials, ["dist/credentials/IntegrationRecoveryApi.credentials.js"]);
assert.deepEqual(pkg.n8n.nodes, ["dist/nodes/IntegrationRecovery/IntegrationRecovery.node.js"]);
assert.equal(pkg.license, "MIT");

const files = [];
async function walk(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}
await walk("credentials");
await walk("nodes");
await walk("shared");
const source = (await Promise.all(files.map((path) => readFile(path, "utf8")))).join("\n");
assert.doesNotMatch(source, /console\.(log|debug|info|warn|error)/);
assert.doesNotMatch(source, /setInterval|webhookMethods|pollTimes|scheduleTrigger/);
assert.doesNotMatch(source, /\b(fetch|axios|got)\s*\(/, "declarative node must use n8n direct routing");
assert.doesNotMatch(source, /BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|PMAK-|GOCSPX-|sp_live_/);
assert.match(source, /\/v1\/checks/);
assert.match(source, /ignoreHttpStatusErrors:\s*true/);
assert.match(source, /returnFullResponse:\s*true/);

process.stdout.write(`local lint PASS (${files.length} source/assets files, zero runtime dependencies)\n`);
