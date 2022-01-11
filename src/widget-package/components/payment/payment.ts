import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { formatCurrency } from '../../../_common/filters/currency';
import { formatUcwords } from '../../../_common/filters/ucwords';
import { useCommonStore } from '../../../_common/store/common-store';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { PaymentData, Store } from '../../store/index';
import AppAddress from '../address/address.vue';
import AppModal from '../modal/modal.vue';

@Options({
	components: {
		AppAddress,
		AppUserAvatarImg,
		AppModal,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppPayment extends Vue {
	commonStore = setup(() => useCommonStore());

	readonly formatUcwords = formatUcwords;
	readonly formatCurrency = formatCurrency;

	get app() {
		return this.commonStore;
	}
	@State game!: Store['game'];
	@State developer!: Store['developer'];
	@State sellable!: Store['sellable'];
	@State pricing!: NonNullable<Store['pricing']>;
	@State price!: NonNullable<Store['price']>;
	@State minOrderAmount!: number;
	@State isShowingIncluded!: boolean;

	@Mutation setPayment!: Store['setPayment'];
	@Action checkout!: Store['checkout'];

	isShowingAddress = false;

	payment = {
		email: '',
		amount: '',
	};

	// From the form library.
	errors: any;

	mounted() {
		this.payment.amount = (this.price! / 100).toFixed(2);
	}

	get user() {
		return this.app.user;
	}

	get minAmount() {
		return this.sellable.type === 'paid'
			? this.pricing!.amount / 100
			: this.minOrderAmount / 100;
	}

	submit(method: any) {
		const paymentData = new PaymentData();
		paymentData.method = method;
		paymentData.amount = parseFloat(this.payment.amount);
		paymentData.email = this.payment.email;

		this.setPayment(paymentData);

		if (paymentData.method === 'cc-stripe') {
			this.checkout();
		} else if (paymentData.method === 'paypal') {
			this.isShowingAddress = true;
		}
	}
}
