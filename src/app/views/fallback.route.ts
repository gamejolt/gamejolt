import Vue from 'vue';
import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../lib/gj-lib-client/utils/utils';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./empty.html';

const fallback = () => asyncComponentLoader( $import( './fallback' ) );

@View
@Component({})
export default class RouteEmpty extends Vue
{
}

export const routeFallbacks: VueRouter.RouteConfig[] = [
	{ name: 'discover.channels.list', path: '/channels', component: RouteEmpty },
	{ name: 'discover.channels.channel.overview', path: '/channel', component: RouteEmpty },

	{ name: 'forums.landing.overview', path: '/forums', component: fallback },

	{ name: 'radio', path: '/radio', component: fallback },

	{ path: '/library', component: RouteEmpty, children: [
		{ name: 'library.overview', path: '', component: fallback },
		{ name: 'library.installed', path: '/installed', component: fallback },
		{ name: 'library.collection.playlist', path: '/playlist/:slug/:id', component: fallback },
		{ name: 'library.collection.followed', path: '/@:id/followed', component: fallback },
		{ name: 'library.collection.developer', path: '/@:id/games', component: fallback },
		{ name: 'library.collection.owned', path: '/@:id/owned', component: fallback },
		{ name: 'library.collection.recommended', path: '/@:id/recommended', component: fallback },
		{ name: 'library.collection.bundle', path: '/library/bundle/:slug/:id/games', component: fallback },
		{ name: 'library.collection.tag', path: '/tag/:id', component: fallback },
	] },

	{ name: 'styleguide', path: '/styleguide', component: fallback },
	{ name: 'settings', path: '/settings', component: fallback },
	{ name: 'client', path: '/client', component: fallback },

	{ path: '/dashboard', component: RouteEmpty, children: [
		{ name: 'dashboard.main.overview', path: '', component: RouteEmpty },
		{ name: 'dashboard.developer.games.add', path: 'games/add', component: RouteEmpty },
	] },
];
