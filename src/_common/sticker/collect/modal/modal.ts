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
		const payload = await Api.sendRequest('/web/stickers/dash');

		this.balance = payload.balance;
		this.stickerCost = payload.stickerCost;

		this.isLoading = false;
	}

	onCollected(count = 1) {
		this.balance -= this.stickerCost * count;
		if (this.balance < this.stickerCost) {
			this.modal.resolve(this.balance);
		}
	}

	onClose() {
		this.modal.resolve(this.balance);
	}
}
