import VueRouter from 'vue-router';
import RouteLanding from './landing';
import { routeLandingPartners } from './partners/partners.route';
import { routeLandingAbout } from './about/about.route';
import { routeLandingGameApi } from './game-api/game-api.route';
import { routeLandingLearn } from './learn/learn.route';
import { routeLandingMarketplace } from './marketplace/marketplace.route';
import { routeLandingClient } from './client/client.route';
import { routeLandingRedlight } from './redlight/redlight.route';
import { routeLandingIndieaf } from './indieaf/indieaf.route';
import { routeLandingGameApiDoc } from './game-api-doc/game-api-doc.route';

export const routeLanding: VueRouter.RouteConfig = {
	path: '',
	props: true,
	component: RouteLanding,
	children: [
		routeLandingClient,
		routeLandingAbout,
		routeLandingGameApi,
		routeLandingGameApiDoc,
		routeLandingLearn,
		routeLandingMarketplace,
		routeLandingPartners,
		routeLandingRedlight,
		routeLandingIndieaf,
	],
};
