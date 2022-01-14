<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppGameMediaBar from '../../game/media-bar/media-bar.vue';
import { MediaItem } from '../../media-item/media-item-model';

@Options({
	components: {
		AppGameMediaBar,
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

	@Watch('items', { deep: true })
	onItemsUpdate() {
		this.trim();
	}

	private trim() {
		this._items = (this.items || []).slice(0, this.num || 6);
	}
}
</script>

<template>
	<div v-if="_items.length" class="widget-compiler-widget-game-media">
		<app-game-media-bar :media-items="_items" />
	</div>
</template>
