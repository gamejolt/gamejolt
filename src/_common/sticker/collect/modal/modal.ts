import { Component } from 'vue-property-decorator';
import { Api } from '../../../api/api.service';
import AppLoading from '../../../loading/loading.vue';
import { BaseModal } from '../../../modal/base';
import AppStickerCollect from '../collect.vue';

@Component({
	components: {
		AppLoading,
		AppStickerCollect,
	},
})
export default class AppStickerCollectModal extends BaseModal {
	isLoading = true;
	balance = 0;
	stickerCost = 10;

	async mounted() {
		const paylaod = await Api.sendRequest('/web/stickers/dash');

		this.balance = paylaod.balance;
		this.stickerCost = paylaod.stickerCost;

		this.isLoading = false;
	}

	onStickerPurchase() {
		this.balance -= this.stickerCost;
		if (this.balance < this.stickerCost) {
			this.modal.resolve();
		}
	}
}
