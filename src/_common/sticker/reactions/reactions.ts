import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { StickerCount } from '../../../app/views/dashboard/stickers/stickers';
import { numberSort } from '../../../utils/array';
import { propRequired } from '../../../utils/vue';
import { DrawerStore, DrawerStoreKey } from '../../drawer/drawer-store';
import { StickerPlacement } from '../placement/placement.model';
import AppStickerReactionItem from './_item/item.vue';

@Component({
	components: {
		AppStickerReactionItem,
	},
})
export default class AppStickerReactions extends Vue {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	@Prop(propRequired(Object)) referenceItem!: Record<'stickers', StickerPlacement[]>;

	reactionsList: StickerCount[] = [];

	mounted() {
		if (!this.referenceItem.stickers) {
			return;
		}

		this.reactionsList = [];
		for (const sticker of this.referenceItem.stickers) {
			const hasSticker = this.reactionsList.find(i => i.sticker.id === sticker.sticker.id);

			if (hasSticker) {
				hasSticker.count++;
			} else {
				this.reactionsList.push({
					count: 1,
					sticker_id: sticker.sticker.id,
					sticker: sticker.sticker,
				});
			}
		}

		this.reactionsList.sort((a, b) => numberSort(b.count, a.count));
	}
}
