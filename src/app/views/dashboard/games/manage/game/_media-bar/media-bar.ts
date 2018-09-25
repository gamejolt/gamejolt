import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./media-bar.html?style=./media-bar.styl';

import {
	AppMediaBarItem,
	MediaBarItemMaxHeight,
} from '../../../../../../../lib/gj-lib-client/components/media-bar/item/item';
import { AppScrollScroller } from '../../../../../../../lib/gj-lib-client/components/scroll/scroller/scroller';
import { RouteAction, RouteStore, Media, RouteMutation } from '../../manage.store';
import { GameMediaItemAddModal } from '../../../../../../components/game/media-item/add-modal/add-modal.service';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { GameMediaItemEditModal } from '../../../../../../components/game/media-item/edit-modal/edit-modal.service';
import { AppEditableOverlay } from '../../../../../../../lib/gj-lib-client/components/editable-overlay/editable-overlay';

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
	@Prop(Game) game!: Game;
	@Prop(Array) mediaItems!: Media[];

	@RouteMutation addMedia!: RouteStore['addMedia'];
	@RouteMutation removeMedia!: RouteStore['removeMedia'];
	@RouteAction saveMediaSort!: RouteStore['saveMediaSort'];

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
