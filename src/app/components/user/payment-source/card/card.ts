import Vue from 'vue';
import View from '!view!./card.html?style=./card.styl';
import { Component, Prop, Emit } from 'vue-property-decorator';
import { AppCard } from '../../../../../lib/gj-lib-client/components/card/card';
import { PaymentSource } from '../../../../../lib/gj-lib-client/components/payment-source/payment-source.model';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';

@View
@Component({
	components: {
		AppCard,
	},
})
export class AppUserPaymentSourceCard extends Vue {
	@Prop(PaymentSource) paymentSource: PaymentSource;
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
