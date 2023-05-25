<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppEmoji, { emojiBaseSize, GJ_EMOJIS } from '../../emoji/AppEmoji.vue';
import { Emoji } from '../../emoji/emoji.model';
import { useContentOwnerController } from '../content-owner';

const props = defineProps({
	emojiId: {
		type: Number,
		default: undefined,
	},
	emojiType: {
		type: String as PropType<(typeof GJ_EMOJIS)[number]>,
		validator: (val: any) => GJ_EMOJIS.includes(val),
		default: undefined,
	},
});

const owner = useContentOwnerController()!;

const emoji = ref<Emoji | (typeof GJ_EMOJIS)[number]>();

if (props.emojiId) {
	owner.hydrator.useData('emoji-id', props.emojiId.toString(), data => {
		if (data) {
			emoji.value = new Emoji(data);
		}
	});
} else {
	// eslint-disable-next-line vue/no-setup-props-destructure
	emoji.value = props.emojiType;
}

// TODO(reactions) remove
const rtxEnabled = !GJ_IS_MOBILE_APP;
</script>

<template>
	<template v-if="emoji">
		<AppEmoji :emoji="emoji" :rtx-enabled="rtxEnabled" />
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