<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import AppResponsiveDimensions from '../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
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

const imgRatio = 0.75;
const imgHeight = POST_TARGET_HEIGHT;
const imgWidth = imgHeight * imgRatio;

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
					width: imgWidth + `px`,
					height: imgHeight + `px`,
				}"
			>
				<AppResponsiveDimensions :parent-width="imgWidth" :ratio="imgRatio">
					<AppMediaItemBackdrop :media-item="realm.cover">
						<AppImgResponsive
							:style="{
								width: `100%`,
								height: `100%`,
								objectFit: `cover`,
							}"
							class="-cover-img"
							:src="realm.cover.mediaserver_url"
							alt=""
						/>
					</AppMediaItemBackdrop>
				</AppResponsiveDimensions>
			</div>
		</template>

		<template #default>
			{{ realm.name }}
		</template>
	</AppPostTarget>
</template>
