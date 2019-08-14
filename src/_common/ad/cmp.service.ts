import { appStore } from '../../vue/services/app/app-store';

type CmpCommand = 'getConsentData' | 'getVendorConsents' | 'ping';

if (!GJ_IS_SSR && !GJ_IS_CLIENT) {
	const _window = window as any;

	_window.__cmp = (command: CmpCommand, _version: any, callback: Function) => {
		// Used https://sandbox.didomi.io/cmp.html to generate a no-consent string.
		const iabConsentData = 'BOOVDdLOOVDdLAHABBENAcAAAAAUWAAA';

		// True if this user is in the EEA, else false.
		const gdprApplies = !!appStore.state.consents.eea;

		// False if there was an error, else true.
		const responseCode = true;

		if (command === 'ping') {
			callback(
				{
					gdprAppliesGlobally: false,
					cmpLoaded: true,
				},
				responseCode
			);
		} else if (command === 'getConsentData') {
			callback({ consentData: iabConsentData, gdprApplies }, responseCode);
		} else if (command === 'getVendorConsents') {
			callback({ metadata: iabConsentData, gdprApplies }, responseCode);
		} else {
			callback(undefined, false);
		}
	};

	// Safeframes.
	window.addEventListener('message', event => {
		const call = event.data.__cmpCall;
		if (call) {
			_window.__cmp(call.command, call.parameter, (retValue: any, success: boolean) => {
				const returnMsg = {
					__cmpReturn: {
						returnValue: retValue,
						success: success,
						callId: call.callId,
					},
				};

				(event.source as Window).postMessage(returnMsg, '*');
			});
		}
	});
}
