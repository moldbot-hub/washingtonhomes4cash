(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.init(root);
})(typeof window !== "undefined" ? window : undefined, function () {
  "use strict";

  var SUPPORTED_EVENTS = new Set(["click_to_call", "generate_lead", "form_error"]);
  var ALLOWED_ERRORS = new Set(["validation", "server", "network"]);

  function eventPayload(name, context) {
    if (!SUPPORTED_EVENTS.has(name)) {
      throw new Error("unsupported analytics event: " + name);
    }
    context = context || {};
    var payload = {
      site_domain: String(context.hostname || "")
        .trim()
        .toLowerCase()
        .replace(/^www\./, "")
        .replace(/\.$/, ""),
      page_path: String(context.pathname || "/").split("?")[0] || "/",
    };
    if (name !== "click_to_call") {
      payload.form_id = String(context.formId || "seller-lead").slice(0, 40);
    }
    if (name === "form_error") {
      payload.error_category = ALLOWED_ERRORS.has(context.errorCategory)
        ? context.errorCategory
        : "server";
    }
    return payload;
  }

  function init(win) {
    if (!win || !win.document || win._smAnalyticsInitialized) return;
    win._smAnalyticsInitialized = true;

    var storage = win.localStorage;
    function get(key) {
      try {
        return JSON.parse(storage.getItem("_sm_" + key));
      } catch (_error) {
        return null;
      }
    }
    function set(key, value) {
      try {
        storage.setItem("_sm_" + key, JSON.stringify(value));
      } catch (_error) {}
    }

    var visitorId = get("vid");
    if (!visitorId) {
      visitorId = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      set("vid", visitorId);
    }
    if (get("referrer") === null) set("referrer", win.document.referrer || "");
    if (get("landing") === null) set("landing", win.location.pathname + win.location.search);
    if (get("utm") === null) {
      var params = new URLSearchParams(win.location.search);
      var utm = {};
      var hasUtm = false;
      ["source", "medium", "campaign", "content", "term"].forEach(function (key) {
        var value = params.get("utm_" + key);
        if (value) {
          utm[key] = value;
          hasUtm = true;
        }
      });
      set("utm", hasUtm ? utm : null);
    }
    var pages = get("pages") || [];
    pages.push({
      url: win.location.pathname + win.location.search,
      title: win.document.title,
      ts: new Date().toISOString(),
    });
    if (pages.length > 50) pages = pages.slice(pages.length - 50);
    set("pages", pages);

    win._smTracking = {
      getData: function () {
        return {
          visitorId: get("vid"),
          referrer: get("referrer") || null,
          landingPage: get("landing") || null,
          utm: get("utm") || null,
          pagesVisited: get("pages") || [],
        };
      },
      clear: function () {
        ["vid", "referrer", "landing", "utm", "pages"].forEach(function (key) {
          try {
            storage.removeItem("_sm_" + key);
          } catch (_error) {}
        });
      },
    };

    function emit(name, context) {
      if (typeof win.gtag !== "function") return;
      win.gtag("event", name, eventPayload(name, {
        hostname: win.location.hostname,
        pathname: win.location.pathname,
        formId: context && context.formId,
        errorCategory: context && context.errorCategory,
      }));
    }

    win._smAnalytics = {
      lead: function (formId) {
        emit("generate_lead", { formId: formId });
      },
      error: function (formId, category) {
        emit("form_error", { formId: formId, errorCategory: category });
      },
    };

    win.document.addEventListener("click", function (event) {
      var target = event && event.target;
      var anchor = target && typeof target.closest === "function"
        ? target.closest('a[href^="tel:"]')
        : null;
      if (anchor) emit("click_to_call");
    });
  }

  return { eventPayload: eventPayload, init: init };
});
