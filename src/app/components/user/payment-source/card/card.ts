import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { PaymentSource } from 'game-jolt-frontend-lib/components/payment-source/payment-source.model';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppUserAddressDetails from '../../address/details/details.vue';


@Component({
	components: {
		AppCard,
		AppUserAddressDetails,
	},
})
export default class AppUserPaymentSourceCard extends Vue {
	@Prop(PaymentSource) paymentSource!: PaymentSource;
	@Prop(Boolean) showRemove?: boolean;

	@Emit('remove')
	emitRemove() {}

	get expires() {
		return this.paymentSource.exp_month + '/' + this.paymentSource.exp_year;
	}

	async remove() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this card?`),
			undefined,
			'yes'
		);
		if (!result) {
			return;
		}

		await this.paymentSource.$remove();

		Growls.success(
			this.$gettext(`Your card has successfully been removed.`),
			this.$gettext(`Card Removed`)
		);

		this.emitRemove();
	}
}
