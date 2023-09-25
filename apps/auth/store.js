import { fetchE, fetchJson } from "@utils/network";

export const actions = {
	get_sites: (filter) => fetchE("/auth/sites", { query: filter }),
	new_site: () => fetchE("/auth/sites", { method: "POST" }),
	mod_site: (site_id, site) => fetchJson(`/auth/sites/${site_id}`, { method: "PUT", body: site }),
	del_site: (site_id) => fetchE(`/auth/sites/${site_id}`, { method: "DELETE" }),

	get_users: (site_id, filter) => fetchE(`/auth/sites/${site_id}/users`, { query: filter }),
	new_user: (site_id, user) => fetchJson(`/auth/sites/${site_id}/users`, { method: "POST", body: user }),
	mod_user: (site_id, user_id, user) => fetchJson(`/auth/sites/${site_id}/users/${user_id}`, { method: "PATCH", body: user }),
	del_user: (site_id, user_id) => fetchE(`/auth/sites/${site_id}/users/${user_id}`, { method: "DELETE" }),

	get_admins: (filter) => fetchE(`/auth/admins`, { query: filter }),
	new_admin: (admin) => fetchJson(`/auth/admins`, { method: "POST", body: admin }),
	mod_admin: (user_id, admin) => fetchJson(`/auth/admins/${user_id}`, { method: "PUT", body: admin }),
	del_admin: (user_id) => fetchE(`/auth/admins/${user_id}`, { method: "DELETE" }),
}