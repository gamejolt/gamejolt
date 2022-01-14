<script lang="ts">
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
</script>

<template>
	<div>
		<form class="payment-form" novalidate>
			<div v-if="!user" class="form-group">
				<label for="email" class="control-label"> Send key to </label>

				<div class="form-group-control">
					<input
						id="email"
						v-model="payment.email"
						v-validate="'required|email'"
						type="text"
						class="form-control"
						name="email"
						placeholder="Enter your email address..."
					/>
				</div>
			</div>
			<div v-else class="form-group">
				<label class="control-label"> Logged in as </label>

				<div class="form-group-control">
					<app-user-avatar-img :user="user" />
					<div class="user-display-name">
						<a
							class="link-unstyled"
							:href="'https://gamejolt.com' + user.url"
							target="_blank"
						>
							{{ user.display_name }}
						</a>
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="amount" class="control-label"> Name your price </label>

				<div class="form-group-control">
					<span class="payment-form-amount-input">
						<span class="payment-form-amount-input-currency">$</span>
						<input
							id="amount"
							v-model="payment.amount"
							v-validate="`required|min_value:${minAmount}|decimal:2`"
							type="number"
							class="form-control"
							name="amount"
							step="1"
						/>
					</span>

					<span v-if="sellable.type === 'paid'" class="text-muted">
						({{ formatCurrency(price) }} or more)

						<span
							v-app-tooltip.touchable="
								`The developer has set the price of this game to ${formatCurrency(
									price
								)}, but you are able to support them by giving more.`
							"
						>
							<app-jolticon icon="help-circle" />
						</span>
					</span>
				</div>
			</div>

			<div v-if="errors.any()" class="form-errors">
				<div class="alert alert-notice">
					<app-jolticon icon="notice" />
					<template v-if="errors.has('email:required')">
						Please enter an email address.
					</template>
					<template v-else-if="errors.has('email:email')">
						Please enter a valid email address.
					</template>
					<template v-else-if="errors.has('amount:required')">
						Please enter an amount.
					</template>
					<template v-else-if="errors.has('amount:min_value')">
						The amount you entered is too low.
					</template>
					<template v-else-if="errors.has('amount:decimal')">
						Please enter a correct amount.
					</template>
				</div>
			</div>
			<div v-else class="payment-methods">
				<app-button
					icon="credit-card"
					:disabled="errors.any() ? 'disabled' : undefined"
					@click.prevent="submit('cc-stripe')"
				>
					Credit Card
				</app-button>

				<app-button
					:disabled="errors.any() ? 'disabled' : undefined"
					@click.prevent="submit('paypal')"
				>
					PayPal
				</app-button>
			</div>
		</form>

		<transition>
			<app-modal v-if="isShowingAddress" @close="isShowingAddress = false">
				<app-address />
			</app-modal>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.payment-form
	margin-bottom: $shell-padding

	::v-deep(.user-avatar-img)
		width: $input-height-base
		float: left

	.user-display-name
		margin-left: $input-height-base + $grid-gutter-width
		line-height: $input-height-base

	&-amount-input
		position: relative
		display: inline-block

		input
			display: inline-block
			width: 80px
			margin-right: 10px
			padding-left: 25px

			@media $media-sm-up
				width: 120px

		&-currency
			theme-prop('color', 'fg-muted')
			position: absolute
			content: '$'
			top: 6px
			left: 10px
			z-index: 2

	.control-label
		float: left
		text-align: right
		line-height: $input-height-base
		width: 100px

		@media $media-sm-up
			width: $thumbnail-width

	.form-group
		clear: left

	.form-group-control
	.form-errors
	.payment-methods
		margin-left: 100px + $grid-gutter-width

		@media $media-sm-up
			margin-left: $thumbnail-width + $grid-gutter-width

	.payment-methods
		clear: both
		text-align: left
</style>
