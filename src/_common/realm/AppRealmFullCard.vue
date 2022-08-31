<script lang="ts" setup>
import { PropType } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';
import AppRealmFollowButton from './AppRealmFollowButton.vue';
import AppRealmLabel from './AppRealmLabel.vue';
import { Realm } from './realm-model';

defineProps({
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
});
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
			<AppMediaItemBackdrop :media-item="realm.cover">
				<AppImgResponsive class="-cover-img" :src="realm.cover.mediaserver_url" alt="" />
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
