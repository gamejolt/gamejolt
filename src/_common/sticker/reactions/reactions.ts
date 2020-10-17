import Vue from 'vue';
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { numberSort } from '../../../utils/array';
import { propRequired } from '../../../utils/vue';
import { DrawerStore, DrawerStoreKey } from '../../drawer/drawer-store';
import { Model } from '../../model/model.service';
import AppStickerReactionItem from './_item/item.vue';

type ReactionCount = {
	stickerId: number;
	imgUrl: string;
	count: number;
};

@Component({
	components: {
		AppStickerReactionItem,
	},
})
export default class AppStickerReactions extends Vue {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	@Prop(propRequired(Model)) model!: Model;

	reactionsList: ReactionCount[] = [];

	mounted() {
		this.onStickersChange();
	}

	@Watch('referenceItem.sticker_counts')
	onStickersChange() {
		this.reactionsList = [];
		if (!this.model.sticker_counts) {
			return;
		}

		const stickerCounts = JSON.parse(this.model.sticker_counts);

		for (const [key, value] of Object.entries(stickerCounts)) {
			this.reactionsList.push({
				stickerId: parseInt(key),
				imgUrl: value.img,
				count: value.num,
			});
		}

		this.reactionsList.sort((a, b) => numberSort(b.count, a.count));
	}
}
