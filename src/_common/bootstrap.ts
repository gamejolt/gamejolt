import Vue from 'vue';
import { VueRouter } from 'vue-router/types/router';
import { VuexStore } from '../lib/gj-lib-client/utils/vuex';
import { hijackLinks } from '../lib/gj-lib-client/utils/router';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { Analytics } from '../lib/gj-lib-client/components/analytics/analytics.service';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { bootstrapAppTranslations } from '../utils/translations';
import { Referrer } from '../lib/gj-lib-client/components/referrer/referrer.service';

/**
 * Bootstraps common services and returns a "createApp" function that our entry point can call to
 * get what it needs.
 */
export function bootstrapCommon(store: VuexStore, router: VueRouter, appComponent: typeof Vue) {
	Meta.init(router);
	Payload.init(store);
	Referrer.init(router);
	Analytics.initRouter(router);
	Connection.init(store);

	hijackLinks(router, 'gamejolt.com');

	return () => {
		bootstrapAppTranslations();

		const app = new Vue({
			store,
			router,
			render: h => h(appComponent),
		});

		return { app, store, router };
	};
}
