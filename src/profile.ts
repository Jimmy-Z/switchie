
enum Mode {
	Proxy,
	PAC,
	Direct,
	System,
	Auto,
}

const DEFAULT_PORTS = new Map([
	["http", 80],
	["https", 443],
	["socks4", 1080],
	["socks5", 1080],
]);

const CR_DEFAULT_BYPASS = [
	"<local>",
	"127.0.0.0/8",
	"[::1]",
	"10.0.0.0/8",
	"172.16.0.0/12",
	"192.168.0.0/16",
]

export default class Profile {
	mode: Mode;
	scheme?: string;
	host?: string;
	port?: number;
	pac_url?: string;
	// caution: [] and undefined are different
	// []: empty bypass list
	// undefined: bypass will be set to CR_DEFAULT_BYPASS
	bypass?: string[];

	constructor(
		mode: Mode,
		arg0?: string,
		arg1?: string
	) {
		this.mode = mode;
		if (mode === Mode.Proxy) {
			const url = new URL(arg0 as string);

			this.scheme = url.protocol.slice(0, -1);
			this.host = url.hostname;

			this.port = parseInt(url.port);
			if (Number.isNaN(this.port)) {
				this.port = DEFAULT_PORTS.get(this.scheme);
			}

			if (arg1 !== undefined) {
				this.bypass = arg1.split(" ").map(x => x.trim()).filter(x => x.length > 0);
			}
		} else if (mode === Mode.PAC) {
			this.pac_url = arg0;
		}
	}

	static from_map(name: string, map: Map<string, string>): Profile {
		// handling special profiles
		name = name.toLowerCase();
		if (name === "direct") {
			return new Profile(Mode.Direct);
		} else if (name === "system") {
			return new Profile(Mode.System);
		} else if (name === "auto") {
			return new Profile(Mode.Auto);
		}

		const proxy = map.get("proxy");
		const pac = map.get("pac");
		if (proxy !== undefined) {
			return new Profile(Mode.Proxy, proxy, map.get("bypass"));
		} else if (pac !== undefined) {
			return new Profile(Mode.PAC, pac);
		}
		throw new Error(`invalid profile: ${JSON.stringify(map)}`);
	}

	static from_conf(conf: string): Profile[] {
		const ret: Profile[] = [];
		let name: string | undefined = undefined;
		let attrs = new Map;
		function sec_finish() {
			if (name !== undefined) {
				ret.push(Profile.from_map(name, attrs));
				attrs = new Map;
			}
		}
		for (let line of conf.split("\n")) {
			line = line.trim();
			if (line.length === 0 || line.startsWith("#")) {
				continue;
			}
			if (line.startsWith("[") && line.endsWith("]")) {
				name = line.slice(1, -1);
				if (name.length === 0) {
					throw new Error("empty profile name is not allowed");
				}
				sec_finish();
			} {
				const [key, value] = line.split("=", 2);
				attrs.set(key.trim(), value.trim());
			}
		}
		sec_finish();
		return ret;
	}

	to_cr(): chrome.proxy.ProxyConfig {
		if (this.mode === Mode.Proxy) {
			return {
				mode: "fixed_servers",
				rules: {
					"singleProxy": {
						scheme: this.scheme,
						host: this.host as string,
						port: this.port,
					},
					"bypassList": this.bypass ?? CR_DEFAULT_BYPASS
				}
			}
		} else if (this.mode === Mode.PAC) {
			return {
				mode: "pac_script",
				pacScript: { url: this.pac_url }
			}
		} else if (this.mode === Mode.Direct) {
			return { mode: "direct" };
		} else if (this.mode === Mode.System) {
			return { mode: "system" };
		} else if (this.mode === Mode.Auto) {
			return { mode: "auto_detect" };
		}
		throw new Error("unreachable");
	}

	// to do: to_fx()
}
