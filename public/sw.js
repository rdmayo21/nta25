if(!self.define){let e,s={};const i=(i,t)=>(i=new URL(i+".js",t).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(t,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let c={};const r=e=>i(e,a),o={module:{uri:a},exports:c,require:r};s[a]=Promise.all(t.map((e=>o[e]||r(e)))).then((e=>(n(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"57ab71043d8172f92e52bcf1dc3013b7"},{url:"/_next/static/chunks/124-65f897a9340622f2.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/173-ec08840c1ec0b3b5.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/288-70fa4eb9ace010ef.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/299-64688916563727ad.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/304-c54975cd2fb51829.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/414-43c44ae14140b508.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/4bd1b696-7ef42e6110d94ced.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/517-0f95e72326dd6d5a.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/525-a15d45a4c9057513.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/678-13ff1cba79cb9a71.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/718-f64d994c65ee5b74.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/757-53f59400c2a7d194.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/809.a7ed922de2431c1e.js",revision:"a7ed922de2431c1e"},{url:"/_next/static/chunks/898.f53c3e893492d2c5.js",revision:"f53c3e893492d2c5"},{url:"/_next/static/chunks/938-108fc6594c2ddc56.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/984-159560899046579c.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/9da6db1e-cafda43fa2f8fae2.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(app)/journal/page-b640e8f50d288a3a.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(app)/layout-c11848ebb4da0551.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(auth)/layout-452cc0c5dcb9b663.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(auth)/login/%5B%5B...login%5D%5D/page-94a3392aa892600f.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(auth)/signup/%5B%5B...signup%5D%5D/page-bdbffbafe2213ea1.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(marketing)/about/page-37c53a04d173fc28.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(marketing)/contact/page-f40b0ec3c1d3a56a.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(marketing)/layout-608004ef531dfb3b.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/(marketing)/pricing/page-bd8456cb34a2eb4c.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/_not-found/page-43be8471041b9283.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/api/stripe/webhooks/route-05a6c68b3c577070.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/api/transcribe/route-0bc0eec8555b54be.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/card-demo/page-d227bed79a7c966d.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/layout-bc989238bca97f68.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/todo/layout-58a733e3aeeba049.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/app/todo/page-80503ab1d06f5876.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/framework-58f97e80b1d6e3ea.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/main-7a2a838973043b40.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/main-app-42bb6b967b12c8d4.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/pages/_app-abffdcde9d309a0c.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/pages/_error-94b8133dd8229633.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-848e258822f13ece.js",revision:"iN82eimp4EOf4UDLvFRsI"},{url:"/_next/static/css/b3cbcd051438d1d5.css",revision:"b3cbcd051438d1d5"},{url:"/_next/static/css/bfffeb0849a84024.css",revision:"bfffeb0849a84024"},{url:"/_next/static/iN82eimp4EOf4UDLvFRsI/_buildManifest.js",revision:"d9c53df264c81a11847252082de9fec4"},{url:"/_next/static/iN82eimp4EOf4UDLvFRsI/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/hero.png",revision:"dc1d6061f23eea606be49c5b1328c38e"},{url:"/manifest.json",revision:"5e86907677e0273fa88844523923d4cd"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
