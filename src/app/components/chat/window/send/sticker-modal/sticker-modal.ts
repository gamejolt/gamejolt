import { Component } from 'vue-property-decorator';
import { numberSort } from '../../../../../../utils/array';
import { Api } from '../../../../../../_common/api/api.service';
import AppIllustration from '../../../../../../_common/illustration/illustration.vue';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../../../_common/modal/base';
import { Sticker } from '../../../../../../_common/sticker/sticker.model';
import { StickerCount } from '../../../../../views/dashboard/stickers/stickers';

@Component({
	components: {
		AppLoading,
		AppIllustration,
	},
})
export default class AppChatWindowSendStickerModal extends BaseModal {
	isLoading = true;
	stickers: StickerCount[] = [];

	async mounted() {
		const payload = await Api.sendRequest(`/web/stickers/dash`);

		this.stickers = payload.stickerCounts.map((stickerCountPayload: any) => {
			const stickerData = payload.stickers.find(
				(i: Sticker) => i.id === stickerCountPayload.sticker_id
			);

			return {
				count: stickerCountPayload.count,
				sticker_id: stickerCountPayload.sticker_id,
				sticker: new Sticker(stickerData),
			} as StickerCount;
		});

		this.stickers.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));

		this.isLoading = false;
	}

	onClickSticker(sticker: Sticker) {
		this.modal.resolve(sticker);
	}
}
