<script lang="ts">
import type { Component } from 'vue';
import { ref } from 'vue';

import { isInstance } from '../../../utils/utils';
import AppEmoji, { emojiBaseSize, GJ_EMOJIS } from '../../emoji/AppEmoji.vue';
import { EmojiModel } from '../../emoji/emoji.model';
import { storeModel } from '../../model/model-store.service';
import { useContentOwnerController } from '../content-owner';

// App bootstrap will assign the component we should render.
let contentEmojiWrapper: any = 'span';

/**
 * Assigns the component that should wrap the AppContentEmoji.
 */
export function setContentEmojiWrapper(newComponent: Component) {
	contentEmojiWrapper = newComponent;
}
</script>

<script lang="ts" setup>
type Props = {
	emojiId?: number;
	emojiType?: (typeof GJ_EMOJIS)[number];
	showDetails?: boolean;
};
const { emojiId, emojiType, showDetails } = defineProps<Props>();

const owner = useContentOwnerController()!;

const emoji = ref<EmojiModel | (typeof GJ_EMOJIS)[number]>();

if (emojiId) {
	owner.hydrator.useData('emoji-id', emojiId.toString(), data => {
		if (data) {
			emoji.value = storeModel(EmojiModel, data);
		}
	});
} else {
	emoji.value = emojiType;
}
</script>

<template>
	<template v-if="emoji">
		<component
			:is="contentEmojiWrapper"
			:data="showDetails && isInstance(emoji, EmojiModel) ? emoji : undefined"
			:show-tooltip="showDetails"
		>
			<AppEmoji :emoji="emoji" />
		</component>
	</template>
	<template v-else>
		<img
			:style="{
				display: `inline-block`,
				width: emojiBaseSize.px,
				height: emojiBaseSize.px,
			}"
			src=""
			:alt="GJ_IS_MOBILE_APP ? undefined : ''"
		/>
	</template>
</template>
