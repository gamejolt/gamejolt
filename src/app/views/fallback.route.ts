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

	{ name: 'radio', path: '/radio', component: fallback },

	{ name: 'styleguide', path: '/styleguide', component: fallback },

	{ path: '/dashboard', component: RouteEmpty, children: [
		{ name: 'dashboard.main.overview', path: '', component: RouteEmpty },
		{ name: 'dashboard.developer.games.add', path: 'games/add', component: RouteEmpty },
	] },
];
