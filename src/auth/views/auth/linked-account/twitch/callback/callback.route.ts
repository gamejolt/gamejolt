import VueRouter from 'vue-router';


export const routeAuthLinkedAccountTwitchCallback: VueRouter.RouteConfig = {
	name: 'auth.linked-account.twitch.callback',
	path: 'twitch/callback',
	props: true,
	component: () => import('./callback'),
};
