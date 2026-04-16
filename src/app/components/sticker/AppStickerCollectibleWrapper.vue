<script lang="ts" setup>
import { toRef } from 'vue';

import { showCollectibleResourceDetailsModal } from '../../../_common/collectible/resource-details-modal/modal.service';
import { EmojiModel } from '../../../_common/emoji/emoji.model';
import { StickerModel } from '../../../_common/sticker/sticker.model';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { isInstance } from '../../../utils/utils';

type Props = {
	data?: EmojiModel | StickerModel;
	showTooltip?: boolean;
};
const { data, showTooltip } = defineProps<Props>();

function onWrapperClick(event: Event) {
	if (data) {
		event.stopPropagation();
		showCollectibleResourceDetailsModal({ item: data });
	}
}

const tooltip = toRef(() => {
	if (showTooltip && data) {
		return isInstance(data, EmojiModel) ? data.commandString : data.name;
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
