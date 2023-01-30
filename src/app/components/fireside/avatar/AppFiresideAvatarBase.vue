<script lang="ts" setup>
import { computed, PropType, toRefs, useSlots } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppRealmThumbnail from '../../../../_common/realm/AppRealmThumbnail.vue';
import { Realm } from '../../../../_common/realm/realm-model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	isPlaceholder: {
		type: Boolean,
	},
	isLive: {
		type: Boolean,
	},
	avatarMediaItem: {
		type: Object as PropType<MediaItem>,
		default: undefined,
	},
	community: {
		type: Object as PropType<Community>,
		default: undefined,
	},
	realm: {
		type: Object as PropType<Realm>,
		default: undefined,
	},
	borderHighlight: {
		type: Boolean,
	},
	borderDashed: {
		type: Boolean,
	},
});

const { isPlaceholder } = toRefs(props);
const slots = useSlots();

const hasTag = computed(() => {
	if (isPlaceholder.value) {
		return true;
	}
	return !!slots.tag;
});

const hasTitle = computed(() => {
	if (isPlaceholder.value) {
		return true;
	}
	return !!slots.title;
});

const hasLink = computed(() => {
	if (isPlaceholder.value) {
		return false;
	}
	return !!slots.link;
});
</script>

<template>
	<div class="fireside-avatar" :class="{ '-placeholder': isPlaceholder }">
		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<AppMediaItemBackdrop
						class="-avatar-img"
						:class="{ '-highlight': borderHighlight, '-dashed': borderDashed }"
						:media-item="avatarMediaItem"
						fallback-color="var(--theme-bg-offset)"
					>
						<slot v-if="!isPlaceholder" name="avatar" />
					</AppMediaItemBackdrop>

					<slot v-if="!isPlaceholder" name="extras" />
				</div>
			</div>

			<!-- TODO(fireside-realms) styling for -realm -->
			<div v-if="realm" class="-realm">
				<AppRealmThumbnail v-if="!isPlaceholder" :realm="realm" />
			</div>

			<div v-if="community" class="-community">
				<AppCommunityThumbnailImg v-if="!isPlaceholder" :community="community" />
			</div>

			<div v-if="hasTag" class="-tag" :class="{ '-live': isLive }">
				<slot v-if="!isPlaceholder" name="tag" />
				<AppTranslate v-else>CHAT</AppTranslate>
			</div>
		</div>

		<div v-if="hasTitle" class="-title">
			<slot v-if="!isPlaceholder" name="title" />
		</div>

		<div v-if="hasLink" class="-base-link">
			<slot v-if="!isPlaceholder" name="link" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.fireside-avatar
	&:not(.-placeholder)
		pressy()

.-subtle
	background-color: var(--theme-bg-subtle)
	border-color: var(--theme-bg-subtle)

.-highlight
	border-color: var(--theme-link)

.-dashed
	border-style: dashed

.-base-link
	::v-deep(> *)
		@extend .-link

.-placeholder
	.-tag
		elevate-0()

		> *
			visibility: hidden

	.-title
		lazy-placeholder-block()
		width: 60%

	.-avatar-img
	.-community
	.-realm
	.-tag
		@extend .-subtle
</style>
