<script lang="ts">
import { StyleValue } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { useDrawerStore } from '../../drawer/drawer-store';
import { Sticker } from '../sticker.model';

@Options({})
export default class AppStickerLayerDrawerItem extends Vue {
	@Prop({ type: Object, required: true }) sticker!: Sticker;
	@Prop({ type: Number, default: 0 }) count!: number;
	@Prop({ type: Number, default: 64 }) size!: number;
	@Prop({ type: Boolean, default: false }) hideCount!: boolean;

	drawerStore = shallowSetup(() => useDrawerStore());

	declare $el: HTMLDivElement;

	get currentStreak() {
		const streak = this.drawerStore.streak.value;
		if (streak?.sticker.id !== this.sticker.id) {
			return 0;
		}

		return streak.count;
	}

	get itemStyling(): StyleValue {
		return {
			height: this.size + 'px',
			width: this.size + 'px',
			cursor: this.drawerStore.isDragging.value ? 'grabbing' : 'grab',
		};
	}

	get isPeeled() {
		return this.drawerStore.sticker.value?.id === this.sticker.id || this.count < 1;
	}
}
</script>

<template>
	<div class="-item" draggable="false" @contextmenu.prevent>
		<div :class="{ '-peeled': isPeeled }">
			<img
				draggable="false"
				class="-img"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</div>

		<div v-if="currentStreak > 1" class="-pocket-left badge fill-dark">
			<div class="-rarity">x{{ currentStreak }}</div>
		</div>

		<div v-if="!hideCount" class="-pocket badge fill-dark">
			<div
				class="-rarity"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
			>
				{{ count }}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	position: relative
	height: 64px
	width: 64px
	user-drag: none
	user-select: none
	touch-action: none

.-peeled
	filter: contrast(0)

.-pocket-left
	position: absolute
	top: 0
	left: 0
	pointer-events: none

.-pocket
	position: absolute
	bottom: 0
	right: 0
	pointer-events: none

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56
</style>
