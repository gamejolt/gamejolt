import VueRouter from 'vue-router';
import RouteLanding from './landing';
import { routeLandingPartners } from './partners/partners.route';
import { routeLandingAbout } from './about/about.route';
import { routeLandingGameApi } from './game-api/game-api.route';
import { routeLandingLearn } from './learn/learn.route';
import { routeLandingMarketplace } from './marketplace/marketplace.route';

export const routeLanding: VueRouter.RouteConfig = {
	path: '',
	component: RouteLanding,
	children: [
		routeLandingAbout,
		routeLandingGameApi,
		routeLandingLearn,
		routeLandingMarketplace,
		routeLandingPartners,
	],
};
