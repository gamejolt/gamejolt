<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';

@Options({
	components: {
		AppContentViewer,
		AppFadeCollapse,
	},
})
export default class AppCommunityDescription extends Vue {
	@Prop({ type: Object, required: true }) community!: CommunityModel;

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
			<AppContentViewer :source="community.description_content" />
		</AppFadeCollapse>

		<a
			class="hidden-text-expander"
			v-if="canToggleDescription"
			@click="toggleDescription()"
		></a>
	</div>
</template>
