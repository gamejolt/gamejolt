import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { UserVerificationApplication } from 'game-jolt-frontend-lib/components/user/verification-application/verification-application';
import AppUserVerifiedTick from 'game-jolt-frontend-lib/components/user/verified-tick/verified-tick.vue';
import { numberSort } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import FormVerifiedAccount from '../../../../components/forms/verified-account/verified-account.vue';
import { Store } from '../../../../store/index';
import { routeStore, RouteStore, RouteStoreModule } from '../account.store';

type VerificationCheckItem = {
	title: string;
	description: string;
	check: boolean;
	required: boolean;
	order: number;
};

type Payload = {
	list: VerificationCheckItem[];
	application: any;
};

@Component({
	name: 'RouteDashAccountVerifiedAccount',
	components: {
		AppUserVerifiedTick,
		FormVerifiedAccount,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/verified-account'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`Your Account Verification`));
	},
})
export default class RouteDashAccountVerifiedAccount extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	list?: VerificationCheckItem[] = [];
	application: UserVerificationApplication | null = null;
	bootstrappedApplication = false;

	get routeTitle() {
		return this.heading;
	}

	get isVerified() {
		return this.app.user && this.app.user.is_verified;
	}

	get canApply() {
		return (
			this.list && this.list.every(i => !i.required || i.check) && this.application === null
		);
	}

	routeResolved($payload: Payload) {
		this.list = Object.values($payload.list).sort((i1, i2) => numberSort(i1.order, i2.order));
		if ($payload.application) {
			this.application = new UserVerificationApplication($payload.application);
		}
		this.bootstrappedApplication = true;
	}
}
