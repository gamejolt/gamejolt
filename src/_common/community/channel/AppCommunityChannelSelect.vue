<script lang="ts" setup>
import { computed, PropType } from 'vue';
import AppPill from '../../pill/AppPill.vue';
import { CommunityChannel } from './channel.model';

const props = defineProps({
	channels: {
		type: Array as PropType<CommunityChannel[]>,
		required: true,
	},
	modelValue: {
		type: Object as PropType<CommunityChannel>,
		default: undefined,
	},
});

const emit = defineEmits({
	'update:modelValue': (_modelValue: CommunityChannel) => true,
});

const validChannels = computed(() => props.channels.filter(i => i.canPost));
</script>

<template>
	<div v-if="validChannels.length">
		<span v-for="channel of validChannels" :key="channel.id">
			<AppPill
				:class="{ active: modelValue && modelValue.id === channel.id }"
				@click="emit('update:modelValue', channel)"
			>
				{{ channel.displayTitle }}
			</AppPill>
		</span>
	</div>
</template>
