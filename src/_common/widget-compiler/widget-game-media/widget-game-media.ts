import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import AppMediaBar from '../../media-bar/media-bar.vue';
import { MediaItem } from '../../media-item/media-item-model';

@Component({
	components: {
		AppMediaBar,
	},
})
export default class AppWidgetCompilerWidgetGameMedia extends Vue {
	@Prop(Array) items!: MediaItem[];
	@Prop(Number) num!: number;

	// We trim based on their `num` param.
	_items: MediaItem[] = [];

	created() {
		this.trim();
	}

	@Watch('items')
	onItemsUpdate() {
		this.trim();
	}

	private trim() {
		this._items = (this.items || []).slice(0, this.num || 6);
	}
}
