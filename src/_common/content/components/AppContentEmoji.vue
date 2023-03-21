<script lang="ts" setup>
import { ref } from 'vue';
import AppEmoji from '../../emoji/AppEmoji.vue';
import { Emoji } from '../../emoji/emoji.model';
import { useContentOwnerController } from '../content-owner';

const props = defineProps({
	emojiId: {
		type: Number,
		required: true,
	},
});

const owner = useContentOwnerController()!;

const emoji = ref<Emoji>();

owner.hydrator.useData('emoji-id', props.emojiId.toString(), data => {
	if (data) {
		emoji.value = new Emoji(data);
	}
});
</script>

<template>
	<span>
		<template v-if="emoji">
			<AppEmoji :emoji="emoji" />
		</template>
		<template v-else>
			<img
				:style="{
					display: `inline-block`,
					width: `25px`,
					height: `25px`,
				}"
				src=""
				alt=""
			/>
		</template>
	</span>
</template>
