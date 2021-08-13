import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { currency } from '../../../../../_common/filters/currency';
import { number } from '../../../../../_common/filters/number';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Translate } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';
import FormWithdrawFunds from '../../../../components/forms/withdraw-funds/withdraw-funds.vue';
import { routeStore, RouteStore, RouteStoreModule } from '../account.store';

@Options({
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
	revenuePending = 0;
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
		showSuccessGrowl(
			this.$gettext('dash.funds.withdraw.success_growl'),
			this.$gettext('dash.funds.withdraw.success_growl_title')
		);

		this.$router.push({ name: 'home' });
	}
}
