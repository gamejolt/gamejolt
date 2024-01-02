<script lang="ts" setup>
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { useProfileRouteStore } from '../RouteProfile.vue';

defineProps({
	showFullDescription: {
		type: Boolean,
		required: true,
	},
	canToggleDescription: {
		type: Boolean,
		required: true,
	},
});

const emit = defineEmits(['update:canToggleDescription', 'update:showFullDescription']);

const { user: routeUser, isOverviewLoaded } = useProfileRouteStore()!;
</script>

<template>
	<template v-if="!isOverviewLoaded">
		<div>
			<span class="lazy-placeholder" />
			<span class="lazy-placeholder" />
			<span class="lazy-placeholder" />
			<span class="lazy-placeholder" style="width: 40%" />
		</div>
		<br />
	</template>
	<template v-else-if="routeUser && routeUser.hasBio">
		<!--
			Set a :key to let vue know that it should update this when the user
			changes.
		-->
		<AppFadeCollapse
			:key="routeUser.bio_content"
			:collapse-height="200"
			:is-open="showFullDescription"
			:animate="false"
			@require-change="emit('update:canToggleDescription', $event)"
			@expand="emit('update:showFullDescription', true)"
		>
			<AppContentViewer :source="routeUser.bio_content" />
		</AppFadeCollapse>

		<a
			v-if="canToggleDescription"
			class="hidden-text-expander"
			@click="emit('update:showFullDescription', !showFullDescription)"
		/>
	</template>
</template>
