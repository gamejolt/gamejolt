import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { AppTooltip } from '../../../_common/tooltip/tooltip';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/loading.vue';
import { BaseModal } from '../../modal/base';
import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

type StickersResponse = {
	stickers: object[];
	stickerCounts: {
		count: number;
		sticker_id: number;
	}[];
	canPlace: boolean;
};

type StickerCount = {
	count: number;
	sticker: Sticker;
};

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
		const result = (await Api.sendRequest(
			'/web/stickers/get-stickers/Fireside_Post/' + this.model.id,
			undefined,
			{
				detach: true,
			}
		)) as StickersResponse;

		for (const stickerData of result.stickers) {
			const sticker = new Sticker(stickerData);
			const count = result.stickerCounts.find(i => i.sticker_id == sticker.id)!.count;
			this.stickerCounts.push({ count, sticker });
		}

		this.canPlace = result.canPlace;

		this.loading = false;
	}

	selectSticker(sticker: Sticker) {
		this.modal.resolve(sticker);
	}
}
