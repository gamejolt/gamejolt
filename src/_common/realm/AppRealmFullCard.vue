<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../media-item/media-item-model';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';
import AppRealmFollowButton from './AppRealmFollowButton.vue';
import AppRealmLabel from './AppRealmLabel.vue';
import { Realm } from './realm-model';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	ratio: {
		type: Number,
		default: 3 / 4,
	},
	overlayContent: {
		type: Boolean,
	},
	noSheet: {
		type: Boolean,
	},
	to: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	/**
	 * Type of media item that should be used for the card. `cover` should be
	 * used for narrow {@link ratio}s, where `header` should be used for wider
	 * ratios.
	 */
	mediaItemType: {
		type: String as PropType<'header' | 'cover'>,
		default: 'cover',
	},
});

const { realm, ratio, mediaItemType } = toRefs(props);

const mediaItem = computed<MediaItem | undefined>(() => realm.value[mediaItemType.value]);
</script>

<template>
	<div
		class="-card"
		:class="{
			'-hoverable': to,
			'-no-sheet': noSheet,
			['sheet sheet-full sheet-elevate']: !noSheet,
		}"
	>
		<RouterLink v-if="to" class="-link-mask" :to="to" />

		<AppRealmLabel class="-label" :overlay="overlayContent" :realm="realm" />

		<AppResponsiveDimensions :ratio="ratio">
			<AppMediaItemBackdrop v-if="mediaItem" :media-item="mediaItem">
				<AppImgResponsive class="-cover-img" :src="mediaItem.mediaserver_url" alt="" />
			</AppMediaItemBackdrop>
		</AppResponsiveDimensions>

		<div class="-follow-button" :class="{ '-follow-button-overlay': overlayContent }">
			<AppRealmFollowButton
				:realm="realm"
				source="fullCard"
				:block="!overlayContent"
				:overlay="overlayContent"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-card
	position: relative
	overflow: hidden
	display: block

.-no-sheet
	elevate-1()
	rounded-corners-lg()

	&.-hoverable:hover
		elevate-2()

.-cover-img
	width: 100%
	height: 100%
	object-fit: cover

.-label
	position: absolute
	left: 8px
	top: 8px
	z-index: 1

.-link-mask
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	z-index: 2

.-follow-button
	padding: 16px

.-follow-button-overlay
	position: absolute
	padding: 0
	right: 8px
	bottom: 8px
	z-index: 3
</style>
