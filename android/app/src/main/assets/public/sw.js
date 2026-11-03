/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable.svg",
    "revision": "8d5be070a36e396c4b17dabd241b025c"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "38edff20de10932e9e9984640023ef44"
  }, {
    "url": "pwa-512x512.png",
    "revision": "88b147fe00c2cc5ae31ebee817afab8a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "ac1af30a4395958f2801e4b6f5a9dfaa"
  }, {
    "url": "index.html",
    "revision": "a585bf2aaefcb4d3dc0e327420a361ff"
  }, {
    "url": "icon.svg",
    "revision": "74fdbb0948ee52908571f838be75dc53"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "dfea124b126f343d2047d1e61b6151bf"
  }, {
    "url": "assets/web-CM0X0D-z.js",
    "revision": null
  }, {
    "url": "assets/web-BXN636Or.js",
    "revision": null
  }, {
    "url": "assets/index-hZFtggXI.js",
    "revision": null
  }, {
    "url": "assets/index-CwaDuomI.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "dfea124b126f343d2047d1e61b6151bf"
  }, {
    "url": "icon.svg",
    "revision": "74fdbb0948ee52908571f838be75dc53"
  }, {
    "url": "pwa-192x192.png",
    "revision": "ac1af30a4395958f2801e4b6f5a9dfaa"
  }, {
    "url": "pwa-512x512.png",
    "revision": "88b147fe00c2cc5ae31ebee817afab8a"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "38edff20de10932e9e9984640023ef44"
  }, {
    "url": "manifest.webmanifest",
    "revision": "4a6c8823c145d75ff79f12f376958018"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
