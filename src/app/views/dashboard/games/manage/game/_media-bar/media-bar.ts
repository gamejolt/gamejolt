import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../../../_common/editable-overlay/editable-overlay.vue';
import { Game } from '../../../../../../../_common/game/game.model';
import { MediaBarItemMaxHeight } from '../../../../../../../_common/media-bar/item/item';
import AppMediaBarItem from '../../../../../../../_common/media-bar/item/item.vue';
import AppScrollScroller from '../../../../../../../_common/scroll/scroller/scroller.vue';
import { GameMediaItemAddModal } from '../../../../../game/media-item/add-modal/add-modal.service';
import { GameMediaItemEditModal } from '../../../../../game/media-item/edit-modal/edit-modal.service';
import { Media, RouteStore, RouteStoreModule } from '../../manage.store';

const draggable = require('vuedraggable');

@Component({
	components: {
		draggable,
		AppScrollScroller,
		AppMediaBarItem,
		AppEditableOverlay,
	},
})
export default class AppManageGameMediaBar extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(Array)
	mediaItems!: Media[];

	@RouteStoreModule.Mutation
	addMedia!: RouteStore['addMedia'];

	@RouteStoreModule.Mutation
	removeMedia!: RouteStore['removeMedia'];

	@RouteStoreModule.Action
	saveMediaSort!: RouteStore['saveMediaSort'];

	mediaBarHeight = MediaBarItemMaxHeight + 40;
	addButtonSize = MediaBarItemMaxHeight;

	get draggableItems() {
		return this.mediaItems;
	}

	set draggableItems(items: Media[]) {
		this.saveMediaSort(items);
	}

	async add() {
		const newItems = await GameMediaItemAddModal.show(this.game);
		if (newItems) {
			this.addMedia(newItems);
		}
	}

	open(item: Media) {
		GameMediaItemEditModal.show(this.game, item, () => {
			this.removeMedia(item);
		});
	}
}
