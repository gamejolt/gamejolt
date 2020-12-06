import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { currency } from '../../../_common/filters/currency';
import { ucwords } from '../../../_common/filters/ucwords';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { PaymentData, Store } from '../../store/index';
import AppAddress from '../address/address.vue';
import AppModal from '../modal/modal.vue';

@Component({
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
	readonly ucwords = ucwords;
	readonly currency = currency;

	@State app!: Store['app'];
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
