globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png": {
		"type": "image/png",
		"etag": "\"2393-AZ8XDyRtFYL6UBwjdLCSlIkEgdA\"",
		"mtime": "2026-07-15T10:02:25.140Z",
		"size": 9107,
		"path": "../public/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png"
	},
	"/greengrulogo.png": {
		"type": "image/png",
		"etag": "\"db97-+dhfNgMZivvY+cIESFOaeQYBgHo\"",
		"mtime": "2026-07-16T00:23:08.199Z",
		"size": 56215,
		"path": "../public/greengrulogo.png"
	},
	"/assets/AppShell-CbTrwNN7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1443e-nf7kMEeIQFFN/Oo3beoEpAFNcdY\"",
		"mtime": "2026-07-16T00:31:19.291Z",
		"size": 83006,
		"path": "../public/assets/AppShell-CbTrwNN7.js"
	},
	"/assets/arrow-right-BrrwCWJI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-Ma/DzXgG+4DjB1hrB2Bh7h+FQWA\"",
		"mtime": "2026-07-16T00:31:19.308Z",
		"size": 154,
		"path": "../public/assets/arrow-right-BrrwCWJI.js"
	},
	"/assets/badge-check-DXYlG18O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"131-1JmFEaQNdHXv+XqSiMMO9A7BN50\"",
		"mtime": "2026-07-16T00:31:19.311Z",
		"size": 305,
		"path": "../public/assets/badge-check-DXYlG18O.js"
	},
	"/assets/chevron-right-MxvneBmw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-oU1773N2zIJWotcTyYgbNVjXRcc\"",
		"mtime": "2026-07-16T00:31:19.313Z",
		"size": 119,
		"path": "../public/assets/chevron-right-MxvneBmw.js"
	},
	"/data/cbam-code-lists.json": {
		"type": "application/json",
		"etag": "\"310fe-wI8Jx+iEdju1CM/FPE4uSKcxMyE\"",
		"mtime": "2026-07-15T14:45:04.878Z",
		"size": 200958,
		"path": "../public/data/cbam-code-lists.json"
	},
	"/assets/arrow-left-BrYvfcD8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-s2+vTyWrHHCoeN5WpQywVeulNbE\"",
		"mtime": "2026-07-16T00:31:19.306Z",
		"size": 154,
		"path": "../public/assets/arrow-left-BrYvfcD8.js"
	},
	"/assets/circle-alert-BL0rdH5x.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ef-koHXU9im1uz7LxWz/hS1tq0m4dU\"",
		"mtime": "2026-07-16T00:31:19.317Z",
		"size": 239,
		"path": "../public/assets/circle-alert-BL0rdH5x.js"
	},
	"/assets/dashboard-data-BQoEi_Jy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3555-982ScWupWGIbS8y5yE9OO2iKg+A\"",
		"mtime": "2026-07-16T00:31:19.322Z",
		"size": 13653,
		"path": "../public/assets/dashboard-data-BQoEi_Jy.js"
	},
	"/assets/entry-B5guClho.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2145-32UPPVmprKpeCas/EVL8g7GIhLo\"",
		"mtime": "2026-07-16T00:31:19.324Z",
		"size": 8517,
		"path": "../public/assets/entry-B5guClho.js"
	},
	"/assets/code-xml-BOy9l_qH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c5-Q8o4e/uQ2i4rQjxkftD4/p8Xoqc\"",
		"mtime": "2026-07-16T00:31:19.319Z",
		"size": 197,
		"path": "../public/assets/code-xml-BOy9l_qH.js"
	},
	"/assets/file-text-DebEnmmK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-KsL6UBEMz11rhcrwa3HGaWIVais\"",
		"mtime": "2026-07-16T00:31:19.326Z",
		"size": 374,
		"path": "../public/assets/file-text-DebEnmmK.js"
	},
	"/assets/full-api-documentation-A6Ul2wD2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"408c-MSIxcsB9ZEAnHklOdRCDRVrEOr0\"",
		"mtime": "2026-07-16T00:31:19.328Z",
		"size": 16524,
		"path": "../public/assets/full-api-documentation-A6Ul2wD2.js"
	},
	"/assets/grant-CGZ9xJBG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98-NAbOkxqE6MI61ps6PrYXv8DWav4\"",
		"mtime": "2026-07-16T00:31:19.331Z",
		"size": 152,
		"path": "../public/assets/grant-CGZ9xJBG.js"
	},
	"/assets/info-izedEoth.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c-FtNdzSQxnuD0RUBeBgSk2O+u8+M\"",
		"mtime": "2026-07-16T00:31:19.334Z",
		"size": 268,
		"path": "../public/assets/info-izedEoth.js"
	},
	"/assets/jsx-runtime-D8nDyRPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-qrBAUPDOR8ROKpBVNEla8AGnGKU\"",
		"mtime": "2026-07-16T00:31:19.337Z",
		"size": 8720,
		"path": "../public/assets/jsx-runtime-D8nDyRPw.js"
	},
	"/assets/loan-BOpdRb-i.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-+lS+aaerELboICNIG6gD/yLIR7I\"",
		"mtime": "2026-07-16T00:31:19.342Z",
		"size": 151,
		"path": "../public/assets/loan-BOpdRb-i.js"
	},
	"/assets/lock-DTpnnlOn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-j8qi93xonEhpdmG/wjLXyHpKVRc\"",
		"mtime": "2026-07-16T00:31:19.345Z",
		"size": 195,
		"path": "../public/assets/lock-DTpnnlOn.js"
	},
	"/assets/loader-circle-DBkn_YYl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-WniYFFd4ONzohkBqeaR2j1J6v9A\"",
		"mtime": "2026-07-16T00:31:19.340Z",
		"size": 204,
		"path": "../public/assets/loader-circle-DBkn_YYl.js"
	},
	"/assets/passport-CIsk4w_c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-zpwdtaKyup4xbUmdooAFTNObCBE\"",
		"mtime": "2026-07-16T00:31:19.348Z",
		"size": 155,
		"path": "../public/assets/passport-CIsk4w_c.js"
	},
	"/assets/new-km2XOxkf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7459-bPgeYRrsIxtFthLfSQ/atcUf9LA\"",
		"mtime": "2026-07-16T00:31:19.346Z",
		"size": 29785,
		"path": "../public/assets/new-km2XOxkf.js"
	},
	"/assets/index-BM4rStGx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5223a-nBX4tu4WvVMZb5BVNHTjnLocg68\"",
		"mtime": "2026-07-16T00:31:19.288Z",
		"size": 336442,
		"path": "../public/assets/index-BM4rStGx.js"
	},
	"/assets/PieChart-C3FQO4J9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5aa2e-6Hnowl6jVsHFilHbcZ5xnkcS/3w\"",
		"mtime": "2026-07-16T00:31:19.297Z",
		"size": 371246,
		"path": "../public/assets/PieChart-C3FQO4J9.js"
	},
	"/assets/FactoryScene-By9mcuWl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2144-ECoGOI8Db314ZT2e65zPYZIHb54\"",
		"mtime": "2026-07-16T00:31:19.295Z",
		"size": 926020,
		"path": "../public/assets/FactoryScene-By9mcuWl.js"
	},
	"/assets/play-B9rKvAJz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"195-/YwlqlSDP56sI4gw0OGDR4G8Tio\"",
		"mtime": "2026-07-16T00:31:19.350Z",
		"size": 405,
		"path": "../public/assets/play-B9rKvAJz.js"
	},
	"/assets/plus-Cv-bhC3H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10b-iDJxNDt9Ecr5k/xE0txDDOxENo8\"",
		"mtime": "2026-07-16T00:31:19.353Z",
		"size": 267,
		"path": "../public/assets/plus-Cv-bhC3H.js"
	},
	"/assets/react-C4Rfxnvq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2498d-wzw6zVuoF5HTj0cNk4YKGM2TMT8\"",
		"mtime": "2026-07-16T00:31:19.355Z",
		"size": 149901,
		"path": "../public/assets/react-C4Rfxnvq.js"
	},
	"/assets/route-flow-t_ksCOV8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-l2ERrqUiXJ6/jdg5t9D7L92kcug\"",
		"mtime": "2026-07-16T00:31:19.357Z",
		"size": 999,
		"path": "../public/assets/route-flow-t_ksCOV8.js"
	},
	"/assets/shield-check-B13dVFDB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-Tsf9JLZTDUcKq0JZL/qwqb6oi8I\"",
		"mtime": "2026-07-16T00:31:19.360Z",
		"size": 309,
		"path": "../public/assets/shield-check-B13dVFDB.js"
	},
	"/assets/routes-CbZC8Mxt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49c3-vBO0WsIsxtelhqzxYzG78htDgpk\"",
		"mtime": "2026-07-16T00:31:19.358Z",
		"size": 18883,
		"path": "../public/assets/routes-CbZC8Mxt.js"
	},
	"/assets/signin-vVE0hMip.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1970-uVToVqeBDQBo7vxQGUQr9S3Elhc\"",
		"mtime": "2026-07-16T00:31:19.362Z",
		"size": 6512,
		"path": "../public/assets/signin-vVE0hMip.js"
	},
	"/assets/upstream-D9J3u_ua.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d038-4g1DqdiBMmjT6vAJ0g6JT6e4dBY\"",
		"mtime": "2026-07-16T00:31:19.365Z",
		"size": 53304,
		"path": "../public/assets/upstream-D9J3u_ua.js"
	},
	"/assets/styles-DU5zPftc.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"188b4-Zn1DtLE5bCdUX4mc4rBctRZZ7P8\"",
		"mtime": "2026-07-16T00:31:19.375Z",
		"size": 100532,
		"path": "../public/assets/styles-DU5zPftc.css"
	},
	"/assets/UpstreamNetworkMap-B2k4QVOw.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"110b0-ktCrTpfc4yMYyf4bIOXbtYXFctY\"",
		"mtime": "2026-07-16T00:31:19.373Z",
		"size": 69808,
		"path": "../public/assets/UpstreamNetworkMap-B2k4QVOw.css"
	},
	"/assets/upstream-map-data-D5Bumvmn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f6-6lcMFCmXRR3pEd8oHp5DMZdyi1M\"",
		"mtime": "2026-07-16T00:31:19.368Z",
		"size": 4342,
		"path": "../public/assets/upstream-map-data-D5Bumvmn.js"
	},
	"/assets/with-selector-CFp_xsem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f3-hdcCzxRbP1mbtadIpj5TC18RT4o\"",
		"mtime": "2026-07-16T00:31:19.370Z",
		"size": 5107,
		"path": "../public/assets/with-selector-CFp_xsem.js"
	},
	"/assets/RoutePage-B3kQbFeP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"72813-dN4M0AMcmBq63PlCuWH9gO2gnso\"",
		"mtime": "2026-07-16T00:31:19.301Z",
		"size": 469011,
		"path": "../public/assets/RoutePage-B3kQbFeP.js"
	},
	"/assets/UpstreamNetworkMap-DEk4oGM9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc5e0-lfHZApyLytyqcmYwgeq5R8Eonro\"",
		"mtime": "2026-07-16T00:31:19.303Z",
		"size": 1033696,
		"path": "../public/assets/UpstreamNetworkMap-DEk4oGM9.js"
	},
	"/templates/CBAM-communication-template.xlsx": {
		"type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"etag": "\"145935-f+qq0aFOhO4MzwnRfi3VNnImGmw\"",
		"mtime": "2026-07-14T13:57:11.073Z",
		"size": 1333557,
		"path": "../public/templates/CBAM-communication-template.xlsx"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_BJbTSX = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_BJbTSX
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
