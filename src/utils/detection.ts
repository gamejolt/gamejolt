// Feature detection for passive events.
export let supportsPassiveEvents = false;
if (!GJ_IS_SSR) {
	try {
		const opts = Object.defineProperty({}, 'passive', {
			get: function() {
				supportsPassiveEvents = true;
			},
		});
		(window as any).addEventListener('test', null, opts);
	} catch (e) {}
}
