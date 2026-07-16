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
	"/greengrulogo.png": {
		"type": "image/png",
		"etag": "\"db97-+dhfNgMZivvY+cIESFOaeQYBgHo\"",
		"mtime": "2026-07-16T00:23:08.199Z",
		"size": 56215,
		"path": "../public/greengrulogo.png"
	},
	"/assets/AppShell-Cq5TNnvJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14c70-L4zCv0FO0VdAFLmaKpfX3pFOz0A\"",
		"mtime": "2026-07-16T10:06:43.266Z",
		"size": 85104,
		"path": "../public/assets/AppShell-Cq5TNnvJ.js"
	},
	"/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png": {
		"type": "image/png",
		"etag": "\"2393-AZ8XDyRtFYL6UBwjdLCSlIkEgdA\"",
		"mtime": "2026-07-15T10:02:25.140Z",
		"size": 9107,
		"path": "../public/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png"
	},
	"/assets/arrow-left-CyF7TfKb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-0z0DoDx/W82amhpxTOIkSUmOXyU\"",
		"mtime": "2026-07-16T10:06:43.277Z",
		"size": 154,
		"path": "../public/assets/arrow-left-CyF7TfKb.js"
	},
	"/assets/badge-check-D3n-lQUj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"131-h9uQL+aK7LdCT+UzJJ+mQtbzk6E\"",
		"mtime": "2026-07-16T10:06:43.282Z",
		"size": 305,
		"path": "../public/assets/badge-check-D3n-lQUj.js"
	},
	"/assets/arrow-right-9JfJLhir.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-ixZ/kzdZKG8jfcMkeFr3GL3SMLI\"",
		"mtime": "2026-07-16T10:06:43.278Z",
		"size": 154,
		"path": "../public/assets/arrow-right-9JfJLhir.js"
	},
	"/assets/check-Da3By_Gj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-TAfN4dRyBLaeszrSMtYnCTE/CPg\"",
		"mtime": "2026-07-16T10:06:43.283Z",
		"size": 113,
		"path": "../public/assets/check-Da3By_Gj.js"
	},
	"/assets/circle-alert-DKxPQIrE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ef-KcIyjYhBRLlmRBYXgXydveKv8Cw\"",
		"mtime": "2026-07-16T10:06:43.286Z",
		"size": 239,
		"path": "../public/assets/circle-alert-DKxPQIrE.js"
	},
	"/assets/chevron-right-QsGEZMXZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-zWtIMY36URkhjyp+Iz4Sc+r6YYA\"",
		"mtime": "2026-07-16T10:06:43.285Z",
		"size": 119,
		"path": "../public/assets/chevron-right-QsGEZMXZ.js"
	},
	"/data/cbam-code-lists.json": {
		"type": "application/json",
		"etag": "\"310fe-wI8Jx+iEdju1CM/FPE4uSKcxMyE\"",
		"mtime": "2026-07-15T14:45:04.878Z",
		"size": 200958,
		"path": "../public/data/cbam-code-lists.json"
	},
	"/assets/dashboard-data-B2gjQ-jz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3563-wPt9ltt2JkXjbMGc+LefOyeogtg\"",
		"mtime": "2026-07-16T10:06:43.288Z",
		"size": 13667,
		"path": "../public/assets/dashboard-data-B2gjQ-jz.js"
	},
	"/assets/full-api-documentation-CzNdi_TH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5838-85g7dhgrXb+NJ4N9pYj1cZKfSrc\"",
		"mtime": "2026-07-16T10:06:43.294Z",
		"size": 22584,
		"path": "../public/assets/full-api-documentation-CzNdi_TH.js"
	},
	"/assets/entry-CZQ2c55W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21b1-Q1Lerq5Jv6kh+H4KbfyP4zjgmnI\"",
		"mtime": "2026-07-16T10:06:43.290Z",
		"size": 8625,
		"path": "../public/assets/entry-CZQ2c55W.js"
	},
	"/assets/grant-DMiEhOJK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98-heuUhZUFRpSzE1wnRwx+2LZQphY\"",
		"mtime": "2026-07-16T10:06:43.296Z",
		"size": 152,
		"path": "../public/assets/grant-DMiEhOJK.js"
	},
	"/assets/file-text-CsJGsqCz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-XvyMckaFImefDsBaMpVFgO8JIXc\"",
		"mtime": "2026-07-16T10:06:43.292Z",
		"size": 374,
		"path": "../public/assets/file-text-CsJGsqCz.js"
	},
	"/assets/info-BjuHWF82.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c-jKOGmSkEZ/983IU8wjOzXsh/N2g\"",
		"mtime": "2026-07-16T10:06:43.298Z",
		"size": 268,
		"path": "../public/assets/info-BjuHWF82.js"
	},
	"/assets/loan-BnZas0V-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-w0CduJE1R2Jy4qlLPtoC6Dt/QqU\"",
		"mtime": "2026-07-16T10:06:43.302Z",
		"size": 151,
		"path": "../public/assets/loan-BnZas0V-.js"
	},
	"/assets/passport-CPuQusX4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-beiKAScbWKv/+P+iC+cbfYWGG+Q\"",
		"mtime": "2026-07-16T10:06:43.310Z",
		"size": 155,
		"path": "../public/assets/passport-CPuQusX4.js"
	},
	"/assets/new-D0xcnBdW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9c09-g8irfvL5fWh+jrY9uf0kkvINnt0\"",
		"mtime": "2026-07-16T10:06:43.307Z",
		"size": 39945,
		"path": "../public/assets/new-D0xcnBdW.js"
	},
	"/assets/lock-BFYpLf-t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-IAWFFwYuiI5NLWbAykgm8sjAuX4\"",
		"mtime": "2026-07-16T10:06:43.305Z",
		"size": 195,
		"path": "../public/assets/lock-BFYpLf-t.js"
	},
	"/assets/jsx-runtime-D8nDyRPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-qrBAUPDOR8ROKpBVNEla8AGnGKU\"",
		"mtime": "2026-07-16T10:06:43.300Z",
		"size": 8720,
		"path": "../public/assets/jsx-runtime-D8nDyRPw.js"
	},
	"/assets/play-BM1PExMf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"195-RqZKmwhdK6diyqH0CCaTr/jQIMk\"",
		"mtime": "2026-07-16T10:06:43.312Z",
		"size": 405,
		"path": "../public/assets/play-BM1PExMf.js"
	},
	"/assets/index-Cv-plFxj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5227a-rK6pcoQiRx829CUEE9c1JqmIolk\"",
		"mtime": "2026-07-16T10:06:43.262Z",
		"size": 336506,
		"path": "../public/assets/index-Cv-plFxj.js"
	},
	"/assets/PieChart-5iXQ701D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5aa2e-kP0mWKiSA7XfN5R9mY5K7uaaF08\"",
		"mtime": "2026-07-16T10:06:43.270Z",
		"size": 371246,
		"path": "../public/assets/PieChart-5iXQ701D.js"
	},
	"/assets/FactoryScene-ByUnOraX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e20e1-lMgtJyP5zkel8Vy2mRi7R+UAsIM\"",
		"mtime": "2026-07-16T10:06:43.269Z",
		"size": 925921,
		"path": "../public/assets/FactoryScene-ByUnOraX.js"
	},
	"/assets/rotate-ccw-Ds-6Mh5w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd-qJKy4N6hnZvg81XZQmyq2S+mCkc\"",
		"mtime": "2026-07-16T10:06:43.316Z",
		"size": 189,
		"path": "../public/assets/rotate-ccw-Ds-6Mh5w.js"
	},
	"/assets/route-flow-t_ksCOV8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-l2ERrqUiXJ6/jdg5t9D7L92kcug\"",
		"mtime": "2026-07-16T10:06:43.319Z",
		"size": 999,
		"path": "../public/assets/route-flow-t_ksCOV8.js"
	},
	"/assets/react-BeWBAZAA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24a1d-s5cSmQIPk8qdRy2S5NLX5GMrMRM\"",
		"mtime": "2026-07-16T10:06:43.314Z",
		"size": 150045,
		"path": "../public/assets/react-BeWBAZAA.js"
	},
	"/assets/RoutePage-CL08NFTk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7faf9-f436mZcAr4KznTP4j9y6N1PsME0\"",
		"mtime": "2026-07-16T10:06:43.272Z",
		"size": 523001,
		"path": "../public/assets/RoutePage-CL08NFTk.js"
	},
	"/assets/routes-DAL-nfU0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a75-migAyEy4Z6FP+OWXE4H9Z6YsMxA\"",
		"mtime": "2026-07-16T10:06:43.321Z",
		"size": 19061,
		"path": "../public/assets/routes-DAL-nfU0.js"
	},
	"/assets/shield-check-Dz3Tuvgq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-3a1T/lsutY77YuewjnJ0X8YKEZk\"",
		"mtime": "2026-07-16T10:06:43.322Z",
		"size": 309,
		"path": "../public/assets/shield-check-Dz3Tuvgq.js"
	},
	"/assets/triangle-alert-DXKzWg4d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"199-5uDni8oDjycvlK2GlSTVus8h+hY\"",
		"mtime": "2026-07-16T10:06:43.325Z",
		"size": 409,
		"path": "../public/assets/triangle-alert-DXKzWg4d.js"
	},
	"/assets/styles-DSBGjWg1.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"18fe6-Snj/rrcwccE3tBzR7SjOuOikQ44\"",
		"mtime": "2026-07-16T10:06:43.336Z",
		"size": 102374,
		"path": "../public/assets/styles-DSBGjWg1.css"
	},
	"/assets/signin-DNbZTIck.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1975-6PiWpdmxqLzzeXJptVjTzj7iw24\"",
		"mtime": "2026-07-16T10:06:43.324Z",
		"size": 6517,
		"path": "../public/assets/signin-DNbZTIck.js"
	},
	"/assets/upstream-Cem7O4t8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf7e-NDOFZQCQtwAbONhSUs3ly/EZT2g\"",
		"mtime": "2026-07-16T10:06:43.327Z",
		"size": 53118,
		"path": "../public/assets/upstream-Cem7O4t8.js"
	},
	"/assets/upstream-map-data-D5Bumvmn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f6-6lcMFCmXRR3pEd8oHp5DMZdyi1M\"",
		"mtime": "2026-07-16T10:06:43.328Z",
		"size": 4342,
		"path": "../public/assets/upstream-map-data-D5Bumvmn.js"
	},
	"/assets/UpstreamNetworkMap-B2k4QVOw.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"110b0-ktCrTpfc4yMYyf4bIOXbtYXFctY\"",
		"mtime": "2026-07-16T10:06:43.334Z",
		"size": 69808,
		"path": "../public/assets/UpstreamNetworkMap-B2k4QVOw.css"
	},
	"/assets/with-selector-CFp_xsem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f3-hdcCzxRbP1mbtadIpj5TC18RT4o\"",
		"mtime": "2026-07-16T10:06:43.332Z",
		"size": 5107,
		"path": "../public/assets/with-selector-CFp_xsem.js"
	},
	"/assets/useDashboardSnapshot-FkYuu4iW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36e-PjEwjWZK3GxNuZeuA7ornvKczcw\"",
		"mtime": "2026-07-16T10:06:43.330Z",
		"size": 878,
		"path": "../public/assets/useDashboardSnapshot-FkYuu4iW.js"
	},
	"/assets/UpstreamNetworkMap-COu8Gmy7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc602-Hwu7BegMkgWoLfjyQicT2uW1RZo\"",
		"mtime": "2026-07-16T10:06:43.275Z",
		"size": 1033730,
		"path": "../public/assets/UpstreamNetworkMap-COu8Gmy7.js"
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
