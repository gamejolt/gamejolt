<script lang="ts" setup>
import { PropType, toRef } from 'vue';
import { Background } from '../../../../_common/background/background.model';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../../../../_common/form-vue/AppFormControl.vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';

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
	...defineFormControlProps(),
});

const background = toRef(props, 'background');

const { applyValue } = createFormControl({
	initialValue: background.value,
	onChange: val => emit('backgroundChange', val),
	validators: toRef(props, 'validators'),
});

const emit = defineEmits({
	backgroundChange: (_item?: Background) => true,
	...defineFormControlEmits(),
});

function onSelect(item?: Background) {
	let result = item;
	if (item?.id === background.value?.id) {
		result = undefined;
	}
	applyValue(result);
}
</script>

<template>
	<AppScrollScroller horizontal thin>
		<div
			class="-items"
			:style="{
				height: tileSize + 'px',
			}"
		>
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

.-item
	rounded-corners()
	overflow: hidden
	border-width: $-border-width
	border-style: none
	transition: border 0.1s ease

	&:hover
	&.-active
		theme-prop('border-color', 'link')
		border-style: solid
</style>
