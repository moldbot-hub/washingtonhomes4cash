const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const analytics = require("../js/tracking.js");

test("all pages use the dedicated seller analytics property", () => {
  const root = path.resolve(__dirname, "..");
  const pages = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
  assert.ok(pages.length > 0);
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(html, /G-F5N9DBL4ZW/, page);
    assert.doesNotMatch(html, /G-22KRBSFPDX/, page);
  }
});

function windowFixture() {
  const values = new Map();
  const listeners = {};
  const calls = [];
  return {
    win: {
      document: {
        referrer: "https://duckduckgo.com/private-query",
        title: "Test page",
        addEventListener(type, handler) { listeners[type] = handler; },
      },
      location: {
        hostname: "WWW.Example.com",
        pathname: "/get-offer.html",
        search: "?utm_source=private-campaign",
      },
      localStorage: {
        getItem(key) { return values.has(key) ? values.get(key) : null; },
        setItem(key, value) { values.set(key, value); },
        removeItem(key) { values.delete(key); },
      },
      gtag(...args) { calls.push(args); },
    },
    calls,
    listeners,
  };
}

test("lead, error, and telephone events use only the canonical fields", () => {
  const { win, calls, listeners } = windowFixture();
  analytics.init(win);
  win._smAnalytics.lead("seller-lead");
  win._smAnalytics.error("seller-lead", "network");
  listeners.click({ target: { closest: () => ({ href: "tel:4255481993" }) } });

  assert.deepEqual(calls, [
    ["event", "generate_lead", {
      site_domain: "example.com",
      page_path: "/get-offer.html",
      form_id: "seller-lead",
    }],
    ["event", "form_error", {
      site_domain: "example.com",
      page_path: "/get-offer.html",
      form_id: "seller-lead",
      error_category: "network",
    }],
    ["event", "click_to_call", {
      site_domain: "example.com",
      page_path: "/get-offer.html",
    }],
  ]);
});

test("serialized analytics never contain submitted or attribution fields", () => {
  const payload = analytics.eventPayload("generate_lead", {
    hostname: "example.com",
    pathname: "/",
    formId: "seller-lead",
    name: "private name",
    phone: "4255550199",
    email: "private@example.com",
    address: "private address",
    message: "private message",
    referrer: "https://duckduckgo.com/private-query",
    utm_source: "private-campaign",
  });
  const serialized = JSON.stringify(payload);
  for (const value of [
    "private name",
    "4255550199",
    "private@example.com",
    "private address",
    "private message",
    "duckduckgo",
    "private-campaign",
  ]) {
    assert.equal(serialized.includes(value), false);
  }
});
