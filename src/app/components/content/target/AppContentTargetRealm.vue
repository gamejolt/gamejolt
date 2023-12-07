<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { REALM_CARD_RATIO } from '../../../../_common/realm/AppRealmFullCard.vue';
import { RealmModel } from '../../../../_common/realm/realm-model';
import AppContentTarget, { CONTENT_TARGET_HEIGHT } from './AppContentTarget.vue';

const props = defineProps({
	realm: {
		type: Object as PropType<RealmModel>,
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
	remove: (_realm: RealmModel) => true,
});

const to = computed(() => (hasLinks.value ? realm.value.routeLocation : undefined));
</script>

<template>
	<AppContentTarget
		bleed-img
		:has-remove="canRemove"
		:no-hover="!hasLinks"
		:to="to"
		@remove="emit('remove', realm)"
	>
		<template #img>
			<div
				:style="{
					width: CONTENT_TARGET_HEIGHT * REALM_CARD_RATIO + 'px',
					height: CONTENT_TARGET_HEIGHT + 'px',
				}"
			>
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
			</div>
		</template>

		<template #default>
			{{ realm.name }}
		</template>
	</AppContentTarget>
</template>
