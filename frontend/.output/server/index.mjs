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
	"/assets/AppShell-CAzyxiE7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14ab5-TpZWxKZRAHcgtfbylXFM/6Gckek\"",
		"mtime": "2026-07-16T08:47:02.728Z",
		"size": 84661,
		"path": "../public/assets/AppShell-CAzyxiE7.js"
	},
	"/assets/arrow-left-C5v2N-Ne.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-vw6ziOsUz7GEPIf/GRYdpwIvGnA\"",
		"mtime": "2026-07-16T08:47:02.745Z",
		"size": 154,
		"path": "../public/assets/arrow-left-C5v2N-Ne.js"
	},
	"/assets/check-DKnGRNhP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-Ub7zHyuR4im4wan2ugC7UGGlkiM\"",
		"mtime": "2026-07-16T08:47:02.753Z",
		"size": 113,
		"path": "../public/assets/check-DKnGRNhP.js"
	},
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
	"/assets/arrow-right-HB1yDBEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-pLOYJQ3b8qMcXNUoRB3ywdk/yUY\"",
		"mtime": "2026-07-16T08:47:02.748Z",
		"size": 154,
		"path": "../public/assets/arrow-right-HB1yDBEk.js"
	},
	"/assets/badge-check-DEtg21JH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"131-6fCq4SsKswZMP44J3hHGWC8xK4A\"",
		"mtime": "2026-07-16T08:47:02.751Z",
		"size": 305,
		"path": "../public/assets/badge-check-DEtg21JH.js"
	},
	"/assets/chevron-right-B13oRyxi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-2RIAmacUqcRbONL8uPXfe66P6xI\"",
		"mtime": "2026-07-16T08:47:02.756Z",
		"size": 119,
		"path": "../public/assets/chevron-right-B13oRyxi.js"
	},
	"/assets/dashboard-data-BQoEi_Jy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3555-982ScWupWGIbS8y5yE9OO2iKg+A\"",
		"mtime": "2026-07-16T08:47:02.761Z",
		"size": 13653,
		"path": "../public/assets/dashboard-data-BQoEi_Jy.js"
	},
	"/assets/circle-alert-DaAeoqFy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ef-wYgIJs5ZcVi/KkUx6LPz6bZZrw4\"",
		"mtime": "2026-07-16T08:47:02.758Z",
		"size": 239,
		"path": "../public/assets/circle-alert-DaAeoqFy.js"
	},
	"/assets/entry-DlVz6K4N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21b1-kYPy6TI0xLVdpxFOtbnuzrrKMwc\"",
		"mtime": "2026-07-16T08:47:02.764Z",
		"size": 8625,
		"path": "../public/assets/entry-DlVz6K4N.js"
	},
	"/assets/file-text-DwGpxUDh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-SuOCKfmk4SFhj7tMwZ019CPezbs\"",
		"mtime": "2026-07-16T08:47:02.767Z",
		"size": 374,
		"path": "../public/assets/file-text-DwGpxUDh.js"
	},
	"/assets/full-api-documentation-BJR_BrfP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5838-hAGKR0P0AzT/zcK2FkdWY+LQN3Y\"",
		"mtime": "2026-07-16T08:47:02.770Z",
		"size": 22584,
		"path": "../public/assets/full-api-documentation-BJR_BrfP.js"
	},
	"/assets/grant-BjcaNJ5q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98-64GQQrBAFTbYy0ykAJFGGT3Plok\"",
		"mtime": "2026-07-16T08:47:02.774Z",
		"size": 152,
		"path": "../public/assets/grant-BjcaNJ5q.js"
	},
	"/assets/loan-CqF3fCN3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-Q1OzLIqKj628Vx2hnUaZoVOI2Mk\"",
		"mtime": "2026-07-16T08:47:02.783Z",
		"size": 151,
		"path": "../public/assets/loan-CqF3fCN3.js"
	},
	"/assets/jsx-runtime-D8nDyRPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-qrBAUPDOR8ROKpBVNEla8AGnGKU\"",
		"mtime": "2026-07-16T08:47:02.780Z",
		"size": 8720,
		"path": "../public/assets/jsx-runtime-D8nDyRPw.js"
	},
	"/assets/info-7Dr1GW8F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c-xTouIEITp3SlcseJ4PIqs33ad4I\"",
		"mtime": "2026-07-16T08:47:02.777Z",
		"size": 268,
		"path": "../public/assets/info-7Dr1GW8F.js"
	},
	"/assets/index-CehhbSoO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"52238-KKMuQubnJIGFnFcpNvPoKoN2O38\"",
		"mtime": "2026-07-16T08:47:02.723Z",
		"size": 336440,
		"path": "../public/assets/index-CehhbSoO.js"
	},
	"/assets/new-CUeGibE7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7451-ZkqxpsTqq/UTaFaOI3YYwDbPwMY\"",
		"mtime": "2026-07-16T08:47:02.789Z",
		"size": 29777,
		"path": "../public/assets/new-CUeGibE7.js"
	},
	"/assets/passport-ujH1ocjA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-lBDe0bEcc7XCOMIHbjl7EWNcNOg\"",
		"mtime": "2026-07-16T08:47:02.791Z",
		"size": 155,
		"path": "../public/assets/passport-ujH1ocjA.js"
	},
	"/assets/PieChart-CPod0HU1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5aa2e-3SUUvfABJxem2NQYjJbh+5DETFc\"",
		"mtime": "2026-07-16T08:47:02.736Z",
		"size": 371246,
		"path": "../public/assets/PieChart-CPod0HU1.js"
	},
	"/assets/lock-iiVexysh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-jwYwIJ6hCzG10KyUnc+iifVMbq8\"",
		"mtime": "2026-07-16T08:47:02.787Z",
		"size": 195,
		"path": "../public/assets/lock-iiVexysh.js"
	},
	"/assets/plus-ChGBHD5U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10b-THzmmxVjwbOgJ3SRjh+uwwV0jQw\"",
		"mtime": "2026-07-16T08:47:02.797Z",
		"size": 267,
		"path": "../public/assets/plus-ChGBHD5U.js"
	},
	"/assets/play-DdJJyTnj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"195-jtXvTBCub+Q6fjFsdIjzUSZlIRc\"",
		"mtime": "2026-07-16T08:47:02.794Z",
		"size": 405,
		"path": "../public/assets/play-DdJJyTnj.js"
	},
	"/assets/FactoryScene-UJ4tj28Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2144-Ij3UqMu3q5pTPGtEzM5/BeDbkV8\"",
		"mtime": "2026-07-16T08:47:02.732Z",
		"size": 926020,
		"path": "../public/assets/FactoryScene-UJ4tj28Z.js"
	},
	"/assets/route-flow-t_ksCOV8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-l2ERrqUiXJ6/jdg5t9D7L92kcug\"",
		"mtime": "2026-07-16T08:47:02.804Z",
		"size": 999,
		"path": "../public/assets/route-flow-t_ksCOV8.js"
	},
	"/assets/shield-check-aV-zjFXs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-natXDucmhvmnSkLHAINua8cbEOo\"",
		"mtime": "2026-07-16T08:47:02.811Z",
		"size": 309,
		"path": "../public/assets/shield-check-aV-zjFXs.js"
	},
	"/assets/react-Du_SKhSC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249e5-k9aPvFRHagsehbw1p1ZtuyUQzp8\"",
		"mtime": "2026-07-16T08:47:02.800Z",
		"size": 149989,
		"path": "../public/assets/react-Du_SKhSC.js"
	},
	"/assets/routes-lnx4c-rg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49c3-XatV1Q4HTROJq/R+XDr13/erF7Y\"",
		"mtime": "2026-07-16T08:47:02.808Z",
		"size": 18883,
		"path": "../public/assets/routes-lnx4c-rg.js"
	},
	"/assets/signin-BHM-eySC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1975-09EPw4jzRVWq3UH/LV98PAmNIxI\"",
		"mtime": "2026-07-16T08:47:02.814Z",
		"size": 6517,
		"path": "../public/assets/signin-BHM-eySC.js"
	},
	"/assets/upstream-DERZfOgA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf7e-tSiuuwY9WwlcKaASi16iSq483lU\"",
		"mtime": "2026-07-16T08:47:02.820Z",
		"size": 53118,
		"path": "../public/assets/upstream-DERZfOgA.js"
	},
	"/assets/triangle-alert-Cc6ofeos.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"199-RR4Lt+90Aq0htW+2c5WxT8KX/v0\"",
		"mtime": "2026-07-16T08:47:02.817Z",
		"size": 409,
		"path": "../public/assets/triangle-alert-Cc6ofeos.js"
	},
	"/assets/styles-Cs1bnL9i.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"18aed-YMMcnzOMEndZKhsIlJUzju7fb0I\"",
		"mtime": "2026-07-16T08:47:02.832Z",
		"size": 101101,
		"path": "../public/assets/styles-Cs1bnL9i.css"
	},
	"/assets/upstream-map-data-D5Bumvmn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f6-6lcMFCmXRR3pEd8oHp5DMZdyi1M\"",
		"mtime": "2026-07-16T08:47:02.823Z",
		"size": 4342,
		"path": "../public/assets/upstream-map-data-D5Bumvmn.js"
	},
	"/assets/with-selector-CFp_xsem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f3-hdcCzxRbP1mbtadIpj5TC18RT4o\"",
		"mtime": "2026-07-16T08:47:02.826Z",
		"size": 5107,
		"path": "../public/assets/with-selector-CFp_xsem.js"
	},
	"/assets/UpstreamNetworkMap-B2k4QVOw.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"110b0-ktCrTpfc4yMYyf4bIOXbtYXFctY\"",
		"mtime": "2026-07-16T08:47:02.829Z",
		"size": 69808,
		"path": "../public/assets/UpstreamNetworkMap-B2k4QVOw.css"
	},
	"/data/cbam-code-lists.json": {
		"type": "application/json",
		"etag": "\"310fe-wI8Jx+iEdju1CM/FPE4uSKcxMyE\"",
		"mtime": "2026-07-15T14:45:04.878Z",
		"size": 200958,
		"path": "../public/data/cbam-code-lists.json"
	},
	"/assets/RoutePage-DPegHZnh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7280b-ney+taPzNowAgg5WprZexiI8T6c\"",
		"mtime": "2026-07-16T08:47:02.739Z",
		"size": 469003,
		"path": "../public/assets/RoutePage-DPegHZnh.js"
	},
	"/assets/UpstreamNetworkMap-Cjd0awpm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc5e0-JCjQzZD1ipUvM8SOgHQpOiMh5uA\"",
		"mtime": "2026-07-16T08:47:02.742Z",
		"size": 1033696,
		"path": "../public/assets/UpstreamNetworkMap-Cjd0awpm.js"
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
