<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';

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
		<app-fade-collapse
			:collapse-height="600"
			:is-open="isDescriptionOpen"
			@require-change="canToggleDescriptionChanged"
		>
			<app-content-viewer :source="channel.description_content" />
		</app-fade-collapse>

		<a v-if="canToggleDescription" class="hidden-text-expander" @click="toggleDescription()" />
	</div>
</template>
