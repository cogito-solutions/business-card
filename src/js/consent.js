(function () {
  const STORAGE_KEY = "cookie_consent_v1";
  const GTM_ID = "G-7QE0ERY5MP";

  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept");
  const rejectBtn = document.getElementById("cookie-reject");
  const settingsBtn = document.getElementById("open-cookie-settings");

  function getConsent() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "accepted" || value === "rejected" ? value : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // ignore storage errors
    }
  }

  function showBanner() {
    if (banner) {
      banner.hidden = false;
    }
  }

  function hideBanner() {
    if (banner) {
      banner.hidden = true;
    }
  }

  function removeCookiesByPrefix(prefixes) {
    const hostname = window.location.hostname;
    const hostnameParts = hostname.split(".");
    const domains = [hostname];

    for (let i = 0; i < hostnameParts.length - 1; i++) {
      domains.push("." + hostnameParts.slice(i).join("."));
    }

    const cookies = document.cookie ? document.cookie.split(";") : [];

    cookies.forEach(function (cookie) {
      const cookieName = cookie.split("=")[0].trim();

      const shouldRemove = prefixes.some(function (prefix) {
        return cookieName === prefix || cookieName.indexOf(prefix) === 0;
      });

      if (!shouldRemove) {
        return;
      }

      domains.forEach(function (domain) {
        document.cookie =
          cookieName +
          "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" +
          domain +
          "; SameSite=Lax";
      });

      document.cookie =
        cookieName +
        "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
    });
  }

  function disableTracking() {
    removeCookiesByPrefix(["_ga", "_gid", "_gat", "_ga_"]);
    window["ga-disable-" + GTM_ID] = true;
  }

  function loadGoogleTagManager(containerId) {
    if (!containerId) return;
    if (document.getElementById("gtm-script")) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });

    const script = document.createElement("script");
    script.id = "gtm-script";
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtm.js?id=" +
      encodeURIComponent(containerId);

    document.head.appendChild(script);
  }

  function acceptConsent() {
    setConsent("accepted");
    hideBanner();
    loadGoogleTagManager(GTM_ID);
  }

  function rejectConsent() {
    setConsent("rejected");
    hideBanner();
    disableTracking();
  }

  function openSettings() {
    showBanner();
  }

  function init() {
    const consent = getConsent();

    if (consent === "accepted") {
      loadGoogleTagManager(GTM_ID);
      return;
    }

    if (consent === "rejected") {
      disableTracking();
      return;
    }

    showBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", acceptConsent);
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", rejectConsent);
  }

if (settingsBtn) {
  settingsBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showBanner();
  });
}

  init();
})();
