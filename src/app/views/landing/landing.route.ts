import { RouteRecordRaw } from 'vue-router';

import { routeLandingAbout } from '~app/views/landing/about/about.route';
import { routeLandingApp } from '~app/views/landing/app/app.route';
import { routeLandingClient } from '~app/views/landing/client/client.route';
import { routeLandingGameApi } from '~app/views/landing/game-api/game-api.route';
import { routeLandingGameApiDoc } from '~app/views/landing/game-api-doc/game-api-doc.route';
import {
	routeLandingHelp,
	routeLandingHelpIndexRedirect,
	routeLandingHelpRedirect,
} from '~app/views/landing/help/help.route';
import { routeLandingIndieaf } from '~app/views/landing/indieaf/indieaf.route';
import { routeLandingLearn } from '~app/views/landing/learn/learn.route';
import { routeLandingMarketplace } from '~app/views/landing/marketplace/marketplace.route';
import { routeLandingPartners } from '~app/views/landing/partners/partners.route';
import { routeLandingRedlight } from '~app/views/landing/redlight/redlight.route';
import RouteLanding from '~app/views/landing/RouteLanding.vue';

export const routeLanding: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/landing',
	component: RouteLanding,
	children: [
		routeLandingApp,
		routeLandingClient,
		routeLandingAbout,
		routeLandingHelp,
		routeLandingHelpIndexRedirect,
		routeLandingHelpRedirect,
		routeLandingGameApi,
		routeLandingGameApiDoc,
		routeLandingLearn,
		routeLandingMarketplace,
		routeLandingPartners,
		routeLandingRedlight,
		routeLandingIndieaf,
	],
};
