import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppMediaBarItem, MediaBarItemMaxHeight } from 'game-jolt-frontend-lib/components/media-bar/item/item';
import AppScrollScroller from 'game-jolt-frontend-lib/components/scroll/scroller/scroller.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameMediaItemAddModal } from '../../../../../../components/game/media-item/add-modal/add-modal.service';
import { GameMediaItemEditModal } from '../../../../../../components/game/media-item/edit-modal/edit-modal.service';
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
