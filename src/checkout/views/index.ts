import Vue from 'vue';
import VueRouter from 'vue-router';
import { routeError404 } from '../../lib/gj-lib-client/components/error/page/page.route';
import { routeCheckout } from './checkout/checkout.route';

Vue.use(VueRouter);

const routes = [routeCheckout, routeError404];

export const router = new VueRouter({
	mode: !GJ_IS_CLIENT ? 'history' : undefined,
	routes,
});
