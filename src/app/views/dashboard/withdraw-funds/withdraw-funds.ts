import { Component } from 'vue-property-decorator';
import View from '!view!./withdraw-funds.html';

import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormWithdrawFunds } from '../../../components/forms/withdraw-funds/withdraw-funds';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashWithdrawFunds',
	components: {
		FormWithdrawFunds,
	},
	filters: {
		currency,
	},
})
export default class RouteDashWithdrawFunds extends BaseRouteComponent {
	user: User = null as any;
	minAmount = 0;
	revenueTotal = 0;
	revenueWithdrawn = 0;
	revenueCurrent = 0;
	revenuePending = 0;
	revenueWithdrawable = 0;
	email = '';

	readonly Screen = Screen;

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/funds');
	}

	get routeTitle() {
		return this.$gettext('dash.funds.withdraw.page_title');
	}

	routed($payload: any) {
		this.user = new User($payload.user);
		this.minAmount = $payload.minAmount || 0;
		this.revenueTotal = $payload.revenueTotal || 0;
		this.revenueWithdrawn = $payload.revenueWithdrawn || 0;
		this.revenueCurrent = $payload.revenueCurrent || 0;
		this.revenuePending = $payload.revenuePending || 0;
		this.revenueWithdrawable = $payload.revenueWithdrawable || 0;
		this.email = $payload.email || '';
	}

	onSubmit() {
		Growls.success(
			this.$gettext('dash.funds.withdraw.success_growl'),
			this.$gettext('dash.funds.withdraw.success_growl_title')
		);

		this.$router.push({ name: 'dash.main.overview' });
	}
}
