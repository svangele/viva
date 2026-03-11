import { onRequestDelete as __api_properties__filename__js_onRequestDelete } from "D:\\Documents\\GitHub\\viva\\functions\\api\\properties\\[filename].js"
import { onRequestGet as __api_properties__filename__js_onRequestGet } from "D:\\Documents\\GitHub\\viva\\functions\\api\\properties\\[filename].js"
import { onRequestPost as __api_login_js_onRequestPost } from "D:\\Documents\\GitHub\\viva\\functions\\api\\login.js"
import { onRequestDelete as __api_properties_index_js_onRequestDelete } from "D:\\Documents\\GitHub\\viva\\functions\\api\\properties\\index.js"
import { onRequestGet as __api_properties_index_js_onRequestGet } from "D:\\Documents\\GitHub\\viva\\functions\\api\\properties\\index.js"
import { onRequestPost as __api_properties_index_js_onRequestPost } from "D:\\Documents\\GitHub\\viva\\functions\\api\\properties\\index.js"
import { onRequestPut as __api_properties_index_js_onRequestPut } from "D:\\Documents\\GitHub\\viva\\functions\\api\\properties\\index.js"

export const routes = [
    {
      routePath: "/api/properties/:filename",
      mountPath: "/api/properties",
      method: "DELETE",
      middlewares: [],
      modules: [__api_properties__filename__js_onRequestDelete],
    },
  {
      routePath: "/api/properties/:filename",
      mountPath: "/api/properties",
      method: "GET",
      middlewares: [],
      modules: [__api_properties__filename__js_onRequestGet],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_js_onRequestPost],
    },
  {
      routePath: "/api/properties",
      mountPath: "/api/properties",
      method: "DELETE",
      middlewares: [],
      modules: [__api_properties_index_js_onRequestDelete],
    },
  {
      routePath: "/api/properties",
      mountPath: "/api/properties",
      method: "GET",
      middlewares: [],
      modules: [__api_properties_index_js_onRequestGet],
    },
  {
      routePath: "/api/properties",
      mountPath: "/api/properties",
      method: "POST",
      middlewares: [],
      modules: [__api_properties_index_js_onRequestPost],
    },
  {
      routePath: "/api/properties",
      mountPath: "/api/properties",
      method: "PUT",
      middlewares: [],
      modules: [__api_properties_index_js_onRequestPut],
    },
  ]