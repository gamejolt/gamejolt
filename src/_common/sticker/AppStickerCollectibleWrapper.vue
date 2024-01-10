<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { EmojiModel } from '../emoji/emoji.model';
import { showStickerCollectibleModal } from './collectible-modal/modal.service';
import { StickerModel } from './sticker.model';

const props = defineProps({
	data: {
		type: Object as PropType<EmojiModel | StickerModel>,
		default: undefined,
	},
});

const { data } = toRefs(props);

function onWrapperClick(event: Event) {
	if (data?.value) {
		event.stopPropagation();
		showStickerCollectibleModal({ item: data.value });
	}
}
</script>

<template>
	<a
		:style="{
			cursor: data ? 'help' : 'default',
		}"
		@click.capture="onWrapperClick($event)"
	>
		<slot />
	</a>
</template>
