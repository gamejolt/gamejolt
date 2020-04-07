import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { AppTooltip } from '../../../_common/tooltip/tooltip';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/loading.vue';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

interface StickerCount {
	count: number;
	sticker: Sticker;
}

@Component({
	components: {
		AppLoading,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppStickerSelectModal extends BaseModal {
	@Prop(propRequired(Model)) model!: Model;

	stickerCounts: StickerCount[] = [];
	loading = true;
	canPlace = false;

	get hasStickers() {
		return this.stickerCounts.length > 0;
	}

	async mounted() {
		const [collectionPayload, canPlacePayload] = await Promise.all(
			[
				'/web/stickers/collection',
				`/web/stickers/can-place/Fireside_Post/${this.model.id}`,
			].map(url => Api.sendRequest(url, undefined, { detach: true }))
		);

		for (const stickerData of collectionPayload.stickers) {
			const sticker = new Sticker(stickerData);
			const count = collectionPayload.stickerCounts.find(
				(i: any) => i.sticker_id === sticker.id
			)!.count;
			this.stickerCounts.push({ count, sticker });
		}

		this.canPlace = canPlacePayload.canPlace;

		this.loading = false;
	}

	selectSticker(sticker: Sticker) {
		this.modal.resolve(sticker);
	}
}
