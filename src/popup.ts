async function click(evt: MouseEvent) {
	if (!(evt.target instanceof HTMLLIElement)) {
		throw new Error("unreachable");
	}
	const id = evt.target.id;
	console.log("click:", id);
	// https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting
	// console.log("old setting", await chrome.proxy.settings.get({}));

	let p_conf;
	// https://developer.chrome.com/docs/extensions/reference/api/proxy
	if (id === "proxy") {
		p_conf = {
			mode: "fixed_servers",
			rules: {
				singleProxy: {
					scheme: "socks5",
					host: "192.168.64.10",
					port: 1072
				},
				bypassList: ["localhost", "127.0.0.0/8", "::1", "192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"]
			}
		};
	} else if (id === "direct") {
		p_conf = {
			mode: "direct",
		};
	} else {
		p_conf = {
			mode: "system",
		};
	}
	await chrome.proxy.settings.set({ value: p_conf });
	await chrome.action.setTitle({ title: id });

	// console.log("new setting", await chrome.proxy.settings.get({}));
}

for (let li of document.getElementsByTagName("li")) {
	li.addEventListener("click", click);
};
