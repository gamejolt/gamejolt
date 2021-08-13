import { Route } from 'vue-router';
import { LocationRedirect } from '../../../utils/router';
import { showInfoGrowl } from '../../../_common/growls/growls.service';

export interface Intent {
	intent: string;
	message: string;
}

export class IntentService {
	static checkRoute(route: Route, ...intents: Intent[]) {
		if (route.query.intent) {
			for (let intent of intents) {
				if (route.query.intent === intent.intent) {
					showInfoGrowl({
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
