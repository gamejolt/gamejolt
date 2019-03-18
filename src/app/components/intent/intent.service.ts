import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { LocationRedirect } from 'game-jolt-frontend-lib/utils/router';
import { Route } from 'vue-router';

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
