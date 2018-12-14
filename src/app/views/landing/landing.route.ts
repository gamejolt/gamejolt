import { RouteConfig } from 'vue-router';
import { routeLandingAbout } from './about/about.route';
import { routeLandingClient } from './client/client.route';
import { routeLandingGameApiDoc } from './game-api-doc/game-api-doc.route';
import { routeLandingGameApi } from './game-api/game-api.route';
import { routeLandingIndieaf } from './indieaf/indieaf.route';
import RouteLanding from './landing';
import { routeLandingLearn } from './learn/learn.route';
import { routeLandingMarketplace } from './marketplace/marketplace.route';
import { routeLandingPartners } from './partners/partners.route';
import { routeLandingRedlight } from './redlight/redlight.route';

export const routeLanding: RouteConfig = {
	path: '',
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
