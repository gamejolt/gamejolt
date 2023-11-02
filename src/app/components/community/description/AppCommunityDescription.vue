<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';

defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
});

const canToggleDescription = ref(false);
const isDescriptionOpen = ref(false);

function toggleDescription() {
	isDescriptionOpen.value = !isDescriptionOpen.value;
}

function canToggleDescriptionChanged(canToggle: boolean) {
	canToggleDescription.value = canToggle;
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

		<a v-if="canToggleDescription" class="hidden-text-expander" @click="toggleDescription()" />
	</div>
</template>
