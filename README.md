
Open source minimalism proxy switcher for Chrome and alike,
designed to be simple and easy to audit at a glance,
providing peace of mind to paranoids like me.

Bug reports are always welcomed.

design
---
* minimal
	* minimal dependencies, currently none
	* minimal permission requirements
	* functionality is limit to manually switching between proxy profiles only
		* a profile can be a proxy with a bypass list or a PAC URL.
	* per protocol proxy is not supported.
	* inline PAC scripts (instead of URL) is not supported, you need to host it somewhere.
	* config is via manually editing config file, to reduce UI code,
		* also because I suck at UI.
	* if you want more features, there're other options,
		I have no intention to implement more features.
* modern practice
	* TypeScript
	* MV3
	* async/await instead of callbacks, for better readability

to do
---
* [ ] better icon
* [x] concept
* [x] conf parsing
* [ ] https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/71075
* [ ] load conf
* [ ] conf editor
* [ ] use badge / action title to indicate current profile
* [ ] firefox support
