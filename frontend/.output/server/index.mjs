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
	"/.DS_Store": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1804-2DcOGx4CXKiuh2nrvcFELzGxdfY\"",
		"mtime": "2026-07-14T16:22:42.654Z",
		"size": 6148,
		"path": "../public/.DS_Store"
	},
	"/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png": {
		"type": "image/png",
		"etag": "\"2393-AZ8XDyRtFYL6UBwjdLCSlIkEgdA\"",
		"mtime": "2026-07-14T16:22:42.654Z",
		"size": 9107,
		"path": "../public/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png"
	},
	"/assets/RoutePage-D0u1zdA1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"297d-D/z2QfrMYL2i3We8IIJqY5loCHo\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 10621,
		"path": "../public/assets/RoutePage-D0u1zdA1.js"
	},
	"/assets/AppShell-DBK2cAyp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"268c6-4T7GLPUc8+YE4GoMP1LQuxN3IUk\"",
		"mtime": "2026-07-14T16:22:42.490Z",
		"size": 157894,
		"path": "../public/assets/AppShell-DBK2cAyp.js"
	},
	"/assets/arrow-right-9NZqls1b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9d-sF1VUb4yEph46CHsxl0C2/xvyxU\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 157,
		"path": "../public/assets/arrow-right-9NZqls1b.js"
	},
	"/assets/check-CB5p5SDa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74-Pu/kaPBsNUqq5NQcsj8H2+D/TR4\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 116,
		"path": "../public/assets/check-CB5p5SDa.js"
	},
	"/assets/circle-check-Cv1cy_BS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-3WoQh74WjxYvi69YYlNPkHaaAaQ\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 170,
		"path": "../public/assets/circle-check-Cv1cy_BS.js"
	},
	"/assets/badge-check-DHr9CIWW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"134-lmM/+SHLeo5SJLNCRjjL4UPZPy0\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 308,
		"path": "../public/assets/badge-check-DHr9CIWW.js"
	},
	"/assets/dashboard-data-DSEZdCTZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3034-jMPQt/yLred2AdDAfm0iTBGUl5Y\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 12340,
		"path": "../public/assets/dashboard-data-DSEZdCTZ.js"
	},
	"/assets/entry-CkpsosiV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1765-nze5BHnHpBBuHK6kiU21X/Lf2kY\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 5989,
		"path": "../public/assets/entry-CkpsosiV.js"
	},
	"/assets/file-text-D_Eg3rvB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23e-uKDXC05EvdZ+pJbHu/FKEtq4+NY\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 574,
		"path": "../public/assets/file-text-D_Eg3rvB.js"
	},
	"/assets/grant-BManLlPZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"92-ZQx8vhrlzhCXk81o9Dq5Hzf4V5w\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 146,
		"path": "../public/assets/grant-BManLlPZ.js"
	},
	"/assets/loan-Cxa2iJKS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"91-v/mVoosAt+ypgALo+o0h8iCY9j4\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 145,
		"path": "../public/assets/loan-Cxa2iJKS.js"
	},
	"/assets/new-CG4D-Fe-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b17-j1F4Gyog3bg0B6C5ehSvPXxnQ3s\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 11031,
		"path": "../public/assets/new-CG4D-Fe-.js"
	},
	"/assets/passport-Ca-jr7uK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"95-SWY/xY4oC0RbxXCN2caGT/KYhss\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 149,
		"path": "../public/assets/passport-Ca-jr7uK.js"
	},
	"/assets/info-CqJegnCL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c4-a5FLk3SPw2jdQHRQXp/n/KZlY6A\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 196,
		"path": "../public/assets/info-CqJegnCL.js"
	},
	"/assets/pipeline-D9nnoDyD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"226a-tr0FdPOhq/ls4xoYURgCT4+VIkI\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 8810,
		"path": "../public/assets/pipeline-D9nnoDyD.js"
	},
	"/assets/ship-CNq01oMe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d7-iMpb/f/WsY4aSO84OaQ/JpbymzQ\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 471,
		"path": "../public/assets/ship-CNq01oMe.js"
	},
	"/assets/signin-DiJ5gtLU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"187f-bKx4zdcIMT55k1K1UPHnGxy2mOg\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 6271,
		"path": "../public/assets/signin-DiJ5gtLU.js"
	},
	"/assets/index-qKkwIvcw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5515b-dfN/svW3ZuCayIrUmSiElkBtbsw\"",
		"mtime": "2026-07-14T16:22:42.490Z",
		"size": 348507,
		"path": "../public/assets/index-qKkwIvcw.js"
	},
	"/assets/shield-check-CT_2qnZY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-ocFI1yLJPu3edOqgEKuVcngUGAM\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 312,
		"path": "../public/assets/shield-check-CT_2qnZY.js"
	},
	"/assets/triangle-alert-CPJMlbaD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"101-eJwDnCqA4YnA2olAHRvqLFGUfME\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 257,
		"path": "../public/assets/triangle-alert-CPJMlbaD.js"
	},
	"/assets/styles-Ck5Xl8Rp.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"165f0-CHt2oUSf+Oq7FxNZosOR00NR9SM\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 91632,
		"path": "../public/assets/styles-Ck5Xl8Rp.css"
	},
	"/assets/routes-BcbKcXjh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ac7a-0uyzNEppHTwIgiMbDxDfiLZhZnE\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 371834,
		"path": "../public/assets/routes-BcbKcXjh.js"
	},
	"/assets/FactoryScene-BkRq2z0w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e20d3-DVjdmrIoCDREeACYpzsP+IML5L0\"",
		"mtime": "2026-07-14T16:22:42.490Z",
		"size": 925907,
		"path": "../public/assets/FactoryScene-BkRq2z0w.js"
	},
	"/assets/zap-C3nufVSv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17f-BIN7FyFb5oR6fGfx9wve4Ib+QZg\"",
		"mtime": "2026-07-14T16:22:42.491Z",
		"size": 383,
		"path": "../public/assets/zap-C3nufVSv.js"
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
var _lazy_2cxnyN = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_2cxnyN
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
