import { fetchE, fetchJson } from "@utils/network";

export const actions = {
	auth_ips: () => fetchE("/ips"),
}