import { RouteRecordRaw } from 'vue-router';
import { routeLandingAbout } from './about/about.route';
import { routeLandingAdtest } from './adtest/adtest.route';
import { routeLandingApp } from './app/app.route';
import { routeLandingClient } from './client/client.route';
import { routeLandingGameApiDoc } from './game-api-doc/game-api-doc.route';
import { routeLandingGameApi } from './game-api/game-api.route';
import { routeLandingHelp } from './help/help.route';
import { routeLandingIndieaf } from './indieaf/indieaf.route';
import RouteLanding from './RouteLanding.vue';
import { routeLandingLearn } from './learn/learn.route';
import { routeLandingMarketplace } from './marketplace/marketplace.route';
import { routeLandingPartners } from './partners/partners.route';
import { routeLandingRedlight } from './redlight/redlight.route';

export const routeLanding: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/landing',
	component: RouteLanding,
	children: [
		routeLandingApp,
		routeLandingClient,
		routeLandingAbout,
		routeLandingHelp,
		routeLandingGameApi,
		routeLandingGameApiDoc,
		routeLandingLearn,
		routeLandingMarketplace,
		routeLandingPartners,
		routeLandingRedlight,
		routeLandingIndieaf,
		routeLandingAdtest,
	],
};
