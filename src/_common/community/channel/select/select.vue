<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppPill from '../../../pill/pill.vue';
import { CommunityChannel } from '../channel.model';

@Options({
	components: {
		AppPill,
	},
})
export default class AppCommunityChannelSelect extends Vue {
	@Prop(Object)
	modelValue?: CommunityChannel;

	@Prop(Array)
	channels!: CommunityChannel[];

	@Emit('update:modelValue')
	emitUpdate(_modelValue: CommunityChannel) {}

	get validChannels() {
		return this.channels.filter(i => i.canPost);
	}
}
</script>

<template>
	<div v-if="validChannels.length">
		<span v-for="channel of validChannels" :key="channel.id">
			<app-pill
				:class="{ active: modelValue && modelValue.id === channel.id }"
				@click="emitUpdate(channel)"
			>
				{{ channel.displayTitle }}
			</app-pill>
		</span>
	</div>
</template>
