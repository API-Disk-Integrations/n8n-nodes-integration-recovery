import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { IntegrationRecoveryApi } from "../dist/credentials/IntegrationRecoveryApi.credentials.js";
import { IntegrationRecovery } from "../dist/nodes/IntegrationRecovery/IntegrationRecovery.node.js";
import { handleChecksResponse, makeSafeError } from "../dist/shared/safe-response.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = join(here, "..", "..", "fixtures");
const fixtureNames = ["additive-safe", "endpoint-breaking", "auth-breaking", "webhook-breaking", "rate-limit-breaking"];
const load = async (name) => JSON.parse(await readFile(join(fixtureRoot, `${name}.json`), "utf8"));

const description = new IntegrationRecovery().description;
const property = (name) => description.properties.find((entry) => entry.name === name);
const operation = property("operation").options[0];

test("is one declarative action operation with no trigger surface", () => {
  assert.equal(description.name, "integrationRecovery");
  assert.equal(description.inputs.length, 1);
  assert.equal(description.outputs.length, 1);
  assert.equal(property("operation").options.length, 1);
  assert.equal(operation.value, "checkIntegrationDrift");
  assert.equal(operation.routing.request.method, "POST");
  assert.equal(operation.routing.request.url, "/v1/checks");
  assert.equal(operation.routing.request.timeout, 10000);
  assert.equal(operation.routing.request.returnFullResponse, true);
  assert.equal(operation.routing.request.ignoreHttpStatusErrors, true);
  assert.deepEqual(description.requestDefaults.baseURL, "https://integrationrecovery-api.com");
  assert.equal("polling" in description, false);
  assert.equal("webhookMethods" in description, false);
  assert.equal("trigger" in description, false);
  assert.equal("execute" in IntegrationRecovery.prototype, false);
});

test("secret credential injects only Bearer auth and tests with a non-billable read", () => {
  const credential = new IntegrationRecoveryApi();
  assert.equal(credential.name, "integrationRecoveryApi");
  assert.equal(credential.properties[0].typeOptions.password, true);
  assert.equal(credential.authenticate.properties.headers.Authorization, "=Bearer {{$credentials.apiKey}}");
  assert.equal(credential.test.request.method, "GET");
  assert.equal(credential.test.request.url, "/v1/usage");
  assert.equal(JSON.stringify(credential).includes("x-api-key"), false);
});

test("single and ordered-batch JSON are exact expression-capable body inputs", () => {
  const check = property("check");
  const checks = property("checks");
  assert.equal(check.type, "json");
  assert.equal(check.default, "={{$json.check}}");
  assert.deepEqual(check.routing.request.body, { check: "={{$value}}" });
  assert.deepEqual(check.displayOptions.show.inputMode, ["single"]);
  assert.equal(checks.type, "json");
  assert.equal(checks.default, "={{$json.checks}}");
  assert.deepEqual(checks.routing.request.body, { checks: "={{$value}}" });
  assert.deepEqual(checks.displayOptions.show.inputMode, ["batch"]);
});

for (const name of fixtureNames) {
  test(`postReceive returns the exact ${name} response`, async () => {
    const fixture = await load(name);
    const input = [{ json: { check: fixture.request.check }, pairedItem: { item: 0 } }];
    const output = await handleChecksResponse(input, { statusCode: 200, body: structuredClone(fixture.response) });
    assert.equal(output.length, 1);
    assert.deepEqual(output[0].json, fixture.response);
    assert.deepEqual(output[0].pairedItem, { item: 0 });
  });
}

test("multi-item expression semantics preserve input order and item links", async () => {
  const first = await load("additive-safe");
  const second = await load("endpoint-breaking");
  const inputs = [first, second];
  const outputs = [];
  for (const [index, fixture] of inputs.entries()) {
    const checkExpressionValue = fixture.request.check;
    const result = await handleChecksResponse(
      [{ json: { check: checkExpressionValue }, pairedItem: { item: index } }],
      { statusCode: 200, body: structuredClone(fixture.response) },
    );
    outputs.push(...result);
  }
  assert.deepEqual(outputs.map((item) => item.json.checks[0].integrationId), [
    "fixture-additive-safe",
    "fixture-endpoint-breaking",
  ]);
  assert.deepEqual(outputs.map((item) => item.pairedItem.item), [0, 1]);
});

test("documented errors preserve safe code, HTTP status, and requestId", async () => {
  const envelopes = JSON.parse(await readFile(join(fixtureRoot, "error-envelopes.json"), "utf8"));
  for (const [name, entry] of Object.entries(envelopes)) {
    await assert.rejects(
      handleChecksResponse([{ json: {} }], { statusCode: entry.status, body: entry.body }),
      (error) => {
        assert.equal(error.name, "IntegrationRecoveryApiError", name);
        assert.equal(error.code, entry.body.error.code, name);
        assert.equal(error.httpCode, String(entry.status), name);
        assert.equal(error.requestId, entry.body.error.requestId, name);
        assert.match(error.description, new RegExp(entry.body.error.requestId));
        return true;
      },
    );
  }
});

test("safe error metadata supports platform continue-on-fail without raw bodies", async () => {
  const fixture = JSON.parse(await readFile(join(fixtureRoot, "error-envelopes.json"), "utf8"));
  const entry = fixture.quota;
  let continueItem;
  try {
    await handleChecksResponse([{ json: {}, pairedItem: { item: 3 } }], { statusCode: entry.status, body: entry.body });
  } catch (error) {
    continueItem = {
      json: {
        error: {
          code: error.code,
          status: Number(error.httpCode),
          message: error.message,
          requestId: error.requestId,
        },
      },
      pairedItem: { item: 3 },
    };
  }
  assert.deepEqual(continueItem.json.error, {
    code: "quota_exceeded",
    status: 429,
    message: "Quota is exhausted.",
    requestId: "00000000-0000-4000-8000-000000000003",
  });
  assert.deepEqual(continueItem.pairedItem, { item: 3 });
  assert.equal(JSON.stringify(continueItem).includes("details"), false);
});

test("redacts bearer and x-api-key values in all safe error fields", () => {
  const secret = "fixture-high-entropy-secret";
  const error = makeSafeError(401, {
    error: {
      code: "invalid_api_key",
      message: `Bearer ${secret}; x-api-key=${secret}`,
      requestId: "00000000-0000-4000-8000-000000000007",
    },
  });
  const rendered = `${error.message}\n${error.stack}\n${error.description}\n${JSON.stringify(error)}`;
  assert.equal(rendered.includes(secret), false);
  assert.match(rendered, /REDACTED/);
});

test("invalid success envelope fails closed and does not become a repair plan", async () => {
  await assert.rejects(
    handleChecksResponse([{ json: {} }], { statusCode: 200, body: { count: 1, checks: [] } }),
    (error) => error.code === "invalid_response" && error.httpCode === "502",
  );
});

test("node contains no retry or remediation execution option", () => {
  const rendered = JSON.stringify(description);
  assert.equal(rendered.includes("retryOnFail"), false);
  assert.equal(rendered.includes("webhook"), false);
  assert.match(property("safetyNotice").displayName, /never modifies/i);
  assert.match(property("safetyNotice").displayName, /never.*retries/i);
  assert.match(property("safetyNotice").displayName, /never.*applies/i);
});
