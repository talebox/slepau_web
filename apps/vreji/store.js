import { fetchE, fetchJson } from "@utils/network";

export const actions = {
	auth_ips: () => fetchE("/ips").then(v => v.json())
		.then((v) => {
			// Order
			const a = Object.entries(v).sort((a, b) => a[1][0] < b[1][0]);
			return a
		}),
	// auth_logins: () => fetchE("/auth_login").then(v=>v.json())
	// 	.then(logins => {
	// 		// [ [nanos, "rubend", ip] , ... ]
	// 		// Order by name
	// 		const by_user = {};
	// 		for (const login in logins) {
	// 			let e = by_user[login[1]];
	// 			by_user[login[1]] = 
	// 		}
			

	// 		// Sort by latest
	// 		logins.sort((a,b) => a[0] < b[0])
			
	// 	}),
}