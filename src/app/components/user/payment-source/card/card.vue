<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../../_common/card/card.vue';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { PaymentSource } from '../../../../../_common/payment-source/payment-source.model';
import AppUserAddressDetails from '../../address/details/details.vue';

@Options({
	components: {
		AppCard,
		AppUserAddressDetails,
	},
})
export default class AppUserPaymentSourceCard extends Vue {
	@Prop(Object) paymentSource!: PaymentSource;
	@Prop(Boolean) showRemove?: boolean;

	@Emit('remove')
	emitRemove() {}

	get expires() {
		return this.paymentSource.exp_month + '/' + this.paymentSource.exp_year;
	}

	async remove() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this card?`)
		);
		if (!result) {
			return;
		}

		await this.paymentSource.$remove();

		showSuccessGrowl(
			this.$gettext(`Your card has successfully been removed.`),
			this.$gettext(`Card Removed`)
		);

		this.emitRemove();
	}
}
</script>

<template>
	<app-card class="payment-source-credit-card">
		<a class="card-remove" @click="remove()" v-if="showRemove">
			<app-jolticon icon="remove" />
		</a>

		<div class="-icon">
			<app-jolticon icon="credit-card" big />
		</div>

		<div class="-body">
			<div class="card-title">
				<h5>
					<translate>Credit Card</translate>
				</h5>
			</div>

			<div class="card-content">
				<div>
					<span class="tag">
						{{ paymentSource.brand }}
					</span>
					****
					{{ paymentSource.last4 }}

					<span class="dot-separator" />
					{{ expires }}
				</div>

				<template v-if="paymentSource.user_address">
					<br />
					<app-user-address-details :address="paymentSource.user_address" />
				</template>
			</div>
		</div>
	</app-card>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-body
	margin-left: 70px
</style>
