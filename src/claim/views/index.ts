import Vue from 'vue';
import VueRouter from 'vue-router';
import { routeError404 } from '../../lib/gj-lib-client/components/error/page/page.route';
import { routeSentKey } from './sent-key/sent-key.route';
import { routeRetrieve } from './retrieve/retrieve.route';
import { routeKey } from './key/key.route';

Vue.use(VueRouter);

const routes = [routeKey, routeRetrieve, routeSentKey, routeError404];

export const router = new VueRouter({
	mode: !GJ_IS_CLIENT ? 'history' : undefined,
	routes,
});
