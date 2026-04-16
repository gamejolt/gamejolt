<script lang="ts" setup>
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppProfileSocialLinks from '../AppProfileSocialLinks.vue';
import { useProfileRouteStore } from '../RouteProfile.vue';

defineProps({
	noBioText: {
		type: String,
		default: '',
	},
});

const showFullDescription = defineModel<boolean>('showFullDescription', { required: true });
const canToggleDescription = defineModel<boolean>('canToggleDescription', { required: true });

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
	<template v-else-if="routeUser">
		<!--
			Set a :key to let vue know that it should update this when the user
			changes.
		-->
		<AppFadeCollapse
			:key="routeUser.bio_content"
			:collapse-height="200"
			:is-open="showFullDescription"
			:animate="false"
			@require-change="canToggleDescription = $event"
			@expand="showFullDescription = true"
		>
			<AppContentViewer v-if="routeUser.hasBio" :source="routeUser.bio_content" />
			<div v-else-if="noBioText.length" class="small text-muted">
				{{ noBioText }}
			</div>

			<AppSpacer :scale="2" vertical />

			<AppProfileSocialLinks />
		</AppFadeCollapse>

		<a
			v-if="canToggleDescription"
			class="hidden-text-expander"
			@click="showFullDescription = !showFullDescription"
		/>
	</template>
</template>
