import VueRouter from 'vue-router';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { LocationRedirect } from '../../../lib/gj-lib-client/utils/router';

export class IntentService {
	static checkRoute(route: VueRouter.Route, intent: string, msg: string) {
		if (route.query.intent) {
			if (route.query.intent === intent) {
				Growls.success(msg);
			}
			return LocationRedirect.fromRoute(route, {}, { intent: undefined });
		}
	}
}
