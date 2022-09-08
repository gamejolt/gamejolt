<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import AppPostTarget, { POST_TARGET_HEIGHT } from './AppPostTarget.vue';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	canRemove: {
		type: Boolean,
	},
	hasLinks: {
		type: Boolean,
	},
});

const { realm, canRemove, hasLinks } = toRefs(props);

const emit = defineEmits({
	remove: (_realm: Realm) => true,
});

const to = computed(() => (hasLinks.value ? realm.value.routeLocation : undefined));
</script>

<template>
	<AppPostTarget
		bleed-img
		:has-remove="canRemove"
		:no-hover="!hasLinks"
		:to="to"
		@remove="emit('remove', realm)"
	>
		<template #img>
			<div
				:style="{
					width: POST_TARGET_HEIGHT / (1 / realm.cover.aspectRatio) + 'px',
					height: POST_TARGET_HEIGHT + 'px',
				}"
			>
				<AppImgResponsive :src="realm.cover.mediaserver_url" alt="" />
			</div>
		</template>

		<template #default>
			{{ realm.name }}
		</template>
	</AppPostTarget>
</template>
