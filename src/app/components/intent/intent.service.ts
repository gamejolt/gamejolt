import { RouteLocationNormalized } from 'vue-router';
import { RouteLocationRedirect } from '../../../utils/router';
import { showInfoGrowl } from '../../../_common/growls/growls.service';

export interface Intent {
	intent: string;
	message: string;
}

export class IntentService {
	static checkRoute(route: RouteLocationNormalized, ...intents: Intent[]) {
		if (route.query.intent) {
			for (const intent of intents) {
				if (route.query.intent === intent.intent) {
					showInfoGrowl({
						sticky: true,
						message: intent.message,
					});
					break;
				}
			}
			return RouteLocationRedirect.fromRoute(route, {}, { intent: undefined });
		}
	}
}
