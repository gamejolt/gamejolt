import View from '!view!./media-bar.html?style=./media-bar.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppEditableOverlay } from '../../../../../../../lib/gj-lib-client/components/editable-overlay/editable-overlay';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import {
	AppMediaBarItem,
	MediaBarItemMaxHeight,
} from '../../../../../../../lib/gj-lib-client/components/media-bar/item/item';
import { AppScrollScroller } from '../../../../../../../lib/gj-lib-client/components/scroll/scroller/scroller';
import { GameMediaItemAddModal } from '../../../../../../components/game/media-item/add-modal/add-modal.service';
import { GameMediaItemEditModal } from '../../../../../../components/game/media-item/edit-modal/edit-modal.service';
import { Media, RouteStore, RouteStoreModule } from '../../manage.store';

const draggable = require('vuedraggable');

@View
@Component({
	components: {
		draggable,
		AppScrollScroller,
		AppMediaBarItem,
		AppEditableOverlay,
	},
})
export class AppManageGameMediaBar extends Vue {
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
