import View from '!view!./media.html?style=./media.styl';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { AppScrollScroller } from 'game-jolt-frontend-lib/components/scroll/scroller/scroller';
import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { AppFormGameDevlogPostMediaItem } from './item/item';

const draggable = require('vuedraggable');

@View
@Component({
	components: {
		draggable,
		AppScrollScroller,
		AppImgResponsive,
		AppFormGameDevlogPostMediaItem,
	},
})
export class AppFormGameDevlogPostMedia extends Vue {
	@Prop(Array)
	mediaItems!: MediaItem[];

	internalMediaItems: MediaItem[] = [];

	@Emit('add')
	emitAdd() {}

	@Emit('sort')
	emitSort(_mediaItems: MediaItem[]) {}

	@Emit('remove')
	emitRemove(_mediaItem: MediaItem) {}

	@Watch('mediaItems', { immediate: true })
	syncMediaItems() {
		this.internalMediaItems = this.mediaItems.slice();
	}
}
