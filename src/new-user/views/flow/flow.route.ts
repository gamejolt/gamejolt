import { RouteConfig } from 'vue-router';
import { routeFlowAvatar } from './avatar/avatar.route';
import { routeFlowBio } from './bio/bio.route';
import { routeFlowExplore } from './explore/explore.route';
import RouteFlow from './flow';
import { routeFlowTags } from './tags/tags.route';

export const routeFlow: RouteConfig = {
	path: '/new-user',
	component: RouteFlow,
	children: [routeFlowAvatar, routeFlowBio, routeFlowTags, routeFlowExplore],
};
