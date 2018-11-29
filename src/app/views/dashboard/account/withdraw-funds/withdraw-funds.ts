import View from '!view!./withdraw-funds.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppExpand } from 'game-jolt-frontend-lib/components/expand/expand';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { FormWithdrawFunds } from '../../../../components/forms/withdraw-funds/withdraw-funds';
import { routeStore, RouteStore, RouteStoreModule } from '../account.store';

@View
@Component({
	name: 'RouteDashAccountWithdrawFunds',
	components: {
		FormWithdrawFunds,
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		currency,
		number,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/funds'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`dash.funds.withdraw.page_title`));
	},
})
export default class RouteDashAccountWithdrawFunds extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	user: User = null as any;
	minAmount = 0;
	revenueTotal = 0;
	revenueWithdrawn = 0;
	revenueSpent = 0;
	revenueCurrent = 0;
	revenuePendingWithdraw = 0;
	revenuePendingActivation = 0;
	walletBalance = 0;
	email = '';
	isShowingRevenueBreakdown = false;

	readonly Screen = Screen;
	readonly currency = currency;
	readonly number = number;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.user = new User($payload.user);
		this.minAmount = $payload.minAmount || 0;
		this.revenueTotal = $payload.revenueTotal || 0;
		this.revenueWithdrawn = $payload.revenueWithdrawn || 0;
		this.revenueSpent = $payload.revenueSpent || 0;
		this.revenueCurrent = $payload.revenueCurrent || 0;
		this.revenuePendingWithdraw = $payload.revenuePendingWithdraw || 0;
		this.revenuePendingActivation = $payload.revenuePendingActivation || 0;
		this.walletBalance = $payload.walletBalance || 0;
		this.email = $payload.email || '';
	}

	onSubmit() {
		Growls.success(
			this.$gettext('dash.funds.withdraw.success_growl'),
			this.$gettext('dash.funds.withdraw.success_growl_title')
		);

		this.$router.push({ name: 'home' });
	}
}
