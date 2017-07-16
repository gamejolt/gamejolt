import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./withdraw-funds.html';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { RouteResolve } from '../../../../lib/gj-lib-client/utils/router';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { FormWithdrawFunds } from '../../../components/forms/withdraw-funds/withdraw-funds';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';

@View
@Component({
	components: {
		FormWithdrawFunds,
	},
	filters: {
		currency,
	},
})
export default class RouteDashWithdrawFunds extends Vue {
	user: User = null as any;
	minAmount = 0;
	revenueTotal = 0;
	revenueWithdrawn = 0;
	revenueCurrent = 0;
	revenuePending = 0;
	revenueWithdrawable = 0;
	email = '';

	readonly Screen = makeObservableService(Screen);

	created() {
		Meta.title = this.$gettext('dash.funds.withdraw.page_title');
	}

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/funds');
	}

	routed() {
		this.user = new User(this.$payload.user);
		this.minAmount = this.$payload.minAmount || 0;
		this.revenueTotal = this.$payload.revenueTotal || 0;
		this.revenueWithdrawn = this.$payload.revenueWithdrawn || 0;
		this.revenueCurrent = this.$payload.revenueCurrent || 0;
		this.revenuePending = this.$payload.revenuePending || 0;
		this.revenueWithdrawable = this.$payload.revenueWithdrawable || 0;
		this.email = this.$payload.email || '';
	}

	onSubmit() {
		Growls.success(
			this.$gettext('dash.funds.withdraw.success_growl'),
			this.$gettext('dash.funds.withdraw.success_growl_title')
		);

		this.$router.push({ name: 'dash.main.overview' });
	}
}
