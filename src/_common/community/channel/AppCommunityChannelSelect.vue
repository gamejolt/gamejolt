<script lang="ts" setup>
import { computed } from 'vue';

import AppPill from '../../pill/AppPill.vue';
import { CommunityChannelModel } from './channel.model';

type Props = {
	channels: CommunityChannelModel[];
};
const { channels } = defineProps<Props>();
const modelValue = defineModel<CommunityChannelModel>();

const validChannels = computed(() => channels.filter(i => i.canPost));
</script>

<template>
	<div v-if="validChannels.length">
		<span v-for="channel of validChannels" :key="channel.id">
			<AppPill
				:class="{ active: modelValue && modelValue.id === channel.id }"
				@click="modelValue = channel"
			>
				{{ channel.displayTitle }}
			</AppPill>
		</span>
	</div>
</template>
