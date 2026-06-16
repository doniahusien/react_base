import { lazy } from "react";

export const routes = [
  { path: "/",                     component: lazy(() => import("./index")) },
  { path: "/users",                component: lazy(() => import("./Users/show-all")) },
  { path: "/users/form",           component: lazy(() => import("./Users/form")) },
  { path: "/users/:id",            component: lazy(() => import("./Users/show")) },
  { path: "/users/form/:id",       component: lazy(() => import("./Users/form")) },
  { path: "/countries",            component: lazy(() => import("./Countries/show-all")) },
  { path: "/countries/form",       component: lazy(() => import("./Countries/form")) },
  { path: "/countries/form/:id",   component: lazy(() => import("./Countries/form")) },
  { path: "/cities",               component: lazy(() => import("./Cities/show-all")) },
  { path: "/cities/form",          component: lazy(() => import("./Cities/form")) },
  { path: "/cities/form/:id",      component: lazy(() => import("./Cities/form")) },
  { path: "/categories",           component: lazy(() => import("./Categories/show-all")) },
  { path: "/categories/form",      component: lazy(() => import("./Categories/form")) },
  { path: "/categories/form/:id",  component: lazy(() => import("./Categories/form")) },
  { path: "/categories/:id",       component: lazy(() => import("./Categories/show")) },
  { path: "/profile",              component: lazy(() => import("./Profile/show")) },
  { path: "/profile/edit",         component: lazy(() => import("./Profile/edit")) },
];
