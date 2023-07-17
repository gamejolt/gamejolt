import { isGoogleBot } from '../device/device.service';
import { Environment } from '../environment/environment.service';

export function getCookie(name: string): Promise<string | undefined> {
	return new Promise(resolve => {
		// Within Client we have to access it this way.
		if (GJ_IS_DESKTOP_APP) {
			const win = nw.Window.get();
			win.cookies.get(
				{
					storeId: '',
					url: 'https://gamejolt.com',
					name,
				},
				cookieData => {
					if (!cookieData) {
						return resolve(undefined);
					}
					return resolve(cookieData.value);
				}
			);
		} else {
			let i, x, y;
			const ARRcookies = document.cookie.split(';');
			for (i = 0; i < ARRcookies.length; i++) {
				x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
				y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
				x = x.replace(/^\s+|\s+$/g, '');
				if (x === name) {
					return resolve(decodeURI(y));
				}
			}
			return resolve(undefined);
		}
	});
}

export function userAgreedToCookies() {
	if (import.meta.env.SSR || isGoogleBot()) {
		return false;
	}
	if (GJ_IS_DESKTOP_APP) {
		return true;
	}
	return !!window.localStorage.getItem('banner:cookie');
}

export function setUserAgreedToCookies() {
	window.localStorage.setItem('banner:cookie', Date.now() + '');
}

export function setTimezoneOffsetCookie() {
	// Only track if user agreed to cookies.
	if (!userAgreedToCookies()) {
		return;
	}

	const cookieName = 'gjtz';

	// Negate the offset, because this function returns the offset from UTC to local time.
	// Example, UTC offset +01:00 is -3600 seconds.
	// But we want to know how far away a user's timezone is from UTC, so we want 3600.
	// * 60 to turn from minutes to seconds.
	const offsetSeconds = new Date().getTimezoneOffset() * -60;

	const expiresTimestamp = Date.now() + 1000 * 60 * 60 * 24 * 7;
	const expires = new Date(expiresTimestamp).toUTCString();

	if (GJ_IS_DESKTOP_APP) {
		const win = nw.Window.get();
		win.cookies.set(
			{
				name: cookieName,
				value: offsetSeconds.toString(),
				expirationDate: Math.floor(expiresTimestamp / 1000),
				url: Environment.baseUrl,
				path: '/',
			},
			() => {}
		);
	} else {
		document.cookie = `${cookieName}=${offsetSeconds}; expires=${expires}; path=/`;
	}
}
