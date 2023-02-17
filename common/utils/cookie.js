// export function get_cookie(name) {
//   return document.cookie.split(";").some((c) => {
//     return c.trim().startsWith(name + "=")
//   })
// }

// export function delete_cookie(name, {path, domain, samesite}={}) {
//   if (get_cookie(name)) {
//     document.cookie =
//       name +
//       "=" +
//       (path ? ";path=" + path : "") +
//       (samesite ? ";SameSite=" + samesite : "") +
//       (domain ? ";domain=" + domain : "") +
//       ";expires=Thu, 01 Jan 1970 00:00:01 GMT"
//   }
// }
