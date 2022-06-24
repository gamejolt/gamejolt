<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppScrollScroller from '../scroll/AppScrollScroller.vue';
import { Background } from './background.model';

const props = defineProps({
	backgrounds: {
		type: Array as PropType<Array<Background>>,
		required: true,
	},
	background: {
		type: Object as PropType<Background>,
		default: undefined,
	},
	tileSize: {
		type: Number,
		default: 56,
		validator: val => typeof val === 'number' && val > 0,
	},
	hideEmptyTile: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
});

const { backgrounds, background, tileSize, disabled } = toRefs(props);

const emit = defineEmits({
	backgroundChange: (_item?: Background) => true,
});

function onSelect(item: Background | undefined) {
	if (disabled.value) {
		return;
	}

	let result = item;
	if (item?.id === background?.value?.id) {
		result = undefined;
	}
	emit('backgroundChange', result);
}
</script>

<template>
	<AppScrollScroller horizontal thin>
		<div
			class="-items"
			:style="{
				height: tileSize + 'px',
				opacity: disabled ? 0.3 : 1,
			}"
		>
			<a
				v-if="!hideEmptyTile"
				class="-item -item-empty"
				:style="{
					width: tileSize + 'px',
					height: tileSize + 'px',
				}"
				@click="() => onSelect(undefined)"
			>
				<div class="-empty-line" />
			</a>

			<a
				v-for="item in backgrounds"
				:key="item.id"
				:class="{ '-active': background?.id === item.id }"
				class="-item"
				:style="{
					width: tileSize + 'px',
					height: tileSize + 'px',
				}"
				@click="() => onSelect(item)"
			>
				<AppImgResponsive :src="item.media_item.mediaserver_url" />
			</a>
		</div>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
$-padding = 12px
$-border-width = $border-width-large

.-items
	white-space: nowrap
	height: $-height
	display: inline-flex
	grid-gap: $-padding
	transition: opacity 300ms

.-item
	rounded-corners()
	overflow: hidden
	border-width: $-border-width
	border-style: none
	transition: border 0.1s ease
	--background-border-color: var(--theme-bg-subtle)

	&:hover
	&.-active
		theme-prop('border-color', 'link')
		border-style: solid
		--background-border-color: var(--theme-link)

.-item-empty
	position: relative
	border-color: var(--background-border-color)
	background-color: var(--theme-bg-offset)
	border-style: solid
	transition: none

.-empty-line
	left: 0
	top: 0
	right: 0
	bottom: 0
	position: absolute
	background-image: linear-gradient(to top left, transparent calc(50% - 1px), var(--background-border-color), transparent calc(50% + 1px))
</style>
