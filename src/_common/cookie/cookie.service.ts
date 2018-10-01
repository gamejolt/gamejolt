export function getCookie(name: string): Promise<string | undefined> {
	return new Promise(resolve => {
		// Within Client we have to access it this way.
		if (GJ_IS_CLIENT) {
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
			let i,
				x,
				y,
				ARRcookies = document.cookie.split(';');
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
