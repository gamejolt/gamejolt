import { RouteConfig } from 'vue-router';
import { routeNewUserAvatar } from './avatar/avatar.route';
import { routeNewUserBio } from './bio/bio.route';
import { routeNewUserExplore } from './explore/explore.route';
import RouteNewUser from './new-user';
import { routeNewUserTags } from './tags/tags.route';

export const routeNewUser: RouteConfig = {
	path: '/new-user',
	component: RouteNewUser,
	children: [routeNewUserAvatar, routeNewUserBio, routeNewUserTags, routeNewUserExplore],
};
