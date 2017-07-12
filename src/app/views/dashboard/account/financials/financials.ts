// angular
// 	.module('App.Views.Dashboard')
// 	.controller('Dashboard.Account.FinancialsCtrl', function(
// 		$scope,
// 		App,
// 		gettextCatalog,
// 		payload
// 	) {
// 		App.title = gettextCatalog.getString('Marketplace Account Setup');

// 		$scope.accountCtrl.heading = gettextCatalog.getString(
// 			'Marketplace Account Setup'
// 		);
// 	});

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./financials.html';
import { RouteResolve } from '../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteMutation, RouteStore } from '../account.state';
import { FormFinancials } from '../../../../components/forms/financials/financials';

@View
@Component({
	components: {
		FormFinancials,
	},
})
export default class RouteDashAccountFinancials extends Vue {
	@RouteMutation setHeading: RouteStore['setHeading'];
	@RouteResolve()
	routeResolved(this: undefined) {}

	routed() {
		Meta.title = this.$gettext('Marketplace Account Setup');
		this.setHeading(this.$gettext('Marketplace Account Setup'));
	}
}
