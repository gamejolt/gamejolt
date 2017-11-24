import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewDownloadSoundtrack: RouteConfig = {
	name: 'discover.games.view.download.soundtrack',
	path: 'download/soundtrack',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './soundtrack'),
	children: [
		// http://localhost:8080/games/tea-time-with-luap-sere-make-the-world-right/soundtracks/download/863
		{
			path: `/games/:slug/soundtracks/download/:id(\\d+)`,
			redirect: to => {
				return {
					name: 'discover.games.view.download.soundtrack',
					params: to.params,
				};
			},
		},
	],
};
