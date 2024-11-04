
import Profile from "./profile";

async function settings_changed(detail: chrome.types.ChromeSettingGetResultDetails) {
	console.log("setting changed", detail);
	if (detail.levelOfControl !== "controlled_by_this_extension") {
		await chrome.storage.local.set({ current: null });
		await chrome.action.setTitle({
			title: "proxy setting is not controlled by this extension currently",
		})
	}
}

async function installed(details: chrome.runtime.InstalledDetails) {
	console.log("installed", details);
	const conf = await chrome.storage.sync.get("conf");
	if (conf === undefined) {
		// to do: call setup page
		return;
	}

	const settings: chrome.types.ChromeSettingGetResultDetails = await chrome.proxy.settings.get({});
	if (settings.levelOfControl !== "controlled_by_this_extension") {
		await chrome.action.setTitle({
			title: "proxy setting is not controlled by this extension currently",
		})
	}
}

async function storage_changed(changes: Record<string, chrome.storage.StorageChange>, area: string) {
	console.log("storage changed", changes, area);
}

chrome.runtime.onInstalled.addListener(installed);
chrome.storage.onChanged.addListener(storage_changed);
chrome.proxy.settings.onChange.addListener(settings_changed);
