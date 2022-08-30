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
	<component
		:is="to ? RouterLink : 'div'"
		class="-card"
		:class="{
			'-link': to,
			'-no-sheet': noSheet,
			['sheet-full sheet-elevate']: !noSheet,
		}"
		:to="to"
	>
		<AppRealmLabel class="-label" :overlay="overlayContent" :realm="realm" />

		<AppResponsiveDimensions :ratio="ratio">
			<AppMediaItemBackdrop :media-item="realm.cover">
				<AppImgResponsive class="-cover-img" :src="realm.cover.mediaserver_url" alt="" />
			</AppMediaItemBackdrop>
		</AppResponsiveDimensions>

		<div class="-content" :class="{ '-content-overlay': overlayContent }">
			<AppRealmFollowButton
				:realm="realm"
				source="fullCard"
				:block="!overlayContent"
				:overlay="overlayContent"
			/>
		</div>
	</component>
</template>

<style lang="stylus" scoped>
.-card
	position: relative
	overflow: hidden
	display: block

.-no-sheet
	elevate-1()
	rounded-corners-lg()

	&.-link:hover
		elevate-2()

.-cover-img
	width: 100%
	height: 100%
	object-fit: cover

.-content
	padding: 16px

.-content-overlay
	position: absolute
	padding: 0
	right: 8px
	bottom: 8px
	z-index: 1

.-label
	position: absolute
	left: 8px
	top: 8px
	z-index: 1
</style>
