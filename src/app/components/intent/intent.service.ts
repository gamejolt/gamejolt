import VueRouter from 'vue-router';
import { Growls, GrowlOptions } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { LocationRedirect } from '../../../lib/gj-lib-client/utils/router';

export interface Intent {
	intent: string;
	data: GrowlOptions;
	type?: 'success' | 'info' | 'error';
}

export class IntentService {
	static checkRoute(route: VueRouter.Route, ...intents: Intent[]) {
		if (route.query.intent) {
			for (let intent of intents) {
				if (route.query.intent === intent.intent) {
					const type = intent.type ? intent.type : 'success';
					switch (type) {
						case 'info':
							Growls.info(intent.data);
							break;
						case 'error':
							Growls.error(intent.data);
							break;
						case 'success':
						default:
							Growls.success(intent.data);
							break;
					}
					break;
				}
			}
			return LocationRedirect.fromRoute(route, {}, { intent: undefined });
		}
	}
}
