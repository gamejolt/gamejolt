<script lang="ts" setup>
import { PropType, toRef, toRefs } from 'vue';
import { isInstance } from '../../utils/utils';
import { showCollectibleResourceDetailsModal } from '../collectible/resource-details-modal/modal.service';
import { EmojiModel } from '../emoji/emoji.model';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import { StickerModel } from './sticker.model';

const props = defineProps({
	data: {
		type: Object as PropType<EmojiModel | StickerModel>,
		default: undefined,
	},
	showTooltip: {
		type: Boolean,
	},
});

const { data, showTooltip } = toRefs(props);

function onWrapperClick(event: Event) {
	if (data?.value) {
		event.stopPropagation();
		showCollectibleResourceDetailsModal({ item: data.value });
	}
}

const tooltip = toRef(() => {
	if (showTooltip.value && data?.value) {
		return isInstance(data.value, EmojiModel) ? data.value.commandString : data.value.name;
	}
	return undefined;
});
</script>

<template>
	<a
		v-app-tooltip="tooltip"
		:style="{
			cursor: data ? 'help' : 'default',
		}"
		@click.capture="onWrapperClick($event)"
	>
		<slot />
	</a>
</template>
