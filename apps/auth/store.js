import { fetchE, fetchJson } from "@utils/network";

export const actions = {
	get_sites: (filter) => fetchE("/sites", { query: filter }),
	new_site: () => fetchE("/sites", { method: "POST" }),
	mod_site: (site_id, site) => fetchJson(`/sites/${site_id}`, { method: "PUT", body: site }),
	del_site: (site_id) => fetchE(`/sites/${site_id}`, { method: "DELETE" }),

	get_users: (site_id, filter) => fetchE(`/sites/${site_id}/users`, { query: filter }),
	new_user: (site_id, user) => fetchJson(`/sites/${site_id}/users`, { method: "POST", body: user }),
	mod_user: (site_id, user_id, user) => fetchJson(`/sites/${site_id}/users/${user_id}`, { method: "PUT", body: user }),
	del_user: (site_id, user_id) => fetchE(`/sites/${site_id}/users/${user_id}`, { method: "DELETE" }),

	get_admins: (filter) => fetchE(`/admins`, { query: filter }),
	new_admin: (admin) => fetchJson(`/admins`, { method: "POST", body: admin }),
	mod_admin: (user_id, admin) => fetchJson(`/admins/${user_id}`, { method: "PUT", body: admin }),
	del_admin: (user_id) => fetchE(`/admins/${user_id}`, { method: "DELETE" }),
}