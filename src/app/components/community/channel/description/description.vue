<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../../_common/AppFadeCollapse.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';

@Options({
	components: {
		AppContentViewer,
		AppFadeCollapse,
	},
})
export default class AppCommunityChannelDescription extends Vue {
	@Prop({ type: Object, required: true }) channel!: CommunityChannel;

	canToggleDescription = false;
	isDescriptionOpen = false;

	toggleDescription() {
		this.isDescriptionOpen = !this.isDescriptionOpen;
	}

	canToggleDescriptionChanged(canToggle: boolean) {
		this.canToggleDescription = canToggle;
	}
}
</script>

<template>
	<div>
		<AppFadeCollapse
			:collapse-height="600"
			:is-open="isDescriptionOpen"
			@require-change="canToggleDescriptionChanged"
		>
			<AppContentViewer :source="channel.description_content" />
		</AppFadeCollapse>

		<a v-if="canToggleDescription" class="hidden-text-expander" @click="toggleDescription()" />
	</div>
</template>
