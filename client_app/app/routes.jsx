import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("/signup", "routes/signup.jsx"),   
  route("/login" , "routes/login.jsx"),    
  route("/dashboard" , "routes/dashboard.jsx" ),
  route("/dashboard/delete/:appId", "routes/delete.jsx"),
  route("/logout",  "routes/logout.jsx" )
];
