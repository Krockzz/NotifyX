import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("/signup", "routes/signup.jsx"),
  route("/login", "routes/login.jsx"),
  route("/dashboard", "routes/dashboard.jsx"),
  route("dashboard/:appId", "routes/application/layout.jsx", [
    index("routes/application/overview.jsx"),
    route("keys", "routes/application/api-keys.jsx"),
    route("entities", "routes/application/entity-groups.jsx"),
    route("events", "routes/application/event-types.jsx"),
    route("templates", "routes/application/templates.jsx"),
    route("channels", "routes/application/channels.jsx"),
    route("activity", "routes/application/activity.jsx"),
    route("settings", "routes/application/settings.jsx"),
  ]),
  route("/dashboard/delete/:appId", "routes/delete.jsx"),
  route("/logout", "routes/logout.jsx"),
];
