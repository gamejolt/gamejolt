import { Route } from 'vue-router';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { LocationRedirect } from '../../../lib/gj-lib-client/utils/router';

export interface Intent {
	intent: string;
	message: string;
}

export class IntentService {
	static checkRoute(route: Route, ...intents: Intent[]) {
		if (route.query.intent) {
			for (let intent of intents) {
				if (route.query.intent === intent.intent) {
					Growls.info({
						sticky: true,
						message: intent.message,
					});
					break;
				}
			}
			return LocationRedirect.fromRoute(route, {}, { intent: undefined });
		}
	}
}
