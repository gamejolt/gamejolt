<script lang="ts" setup>
import { computed, CSSProperties, PropType, ref, toRefs } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';
import AppRealmFollowButton from './AppRealmFollowButton.vue';
import AppRealmLabel from './AppRealmLabel.vue';
import { Realm, toggleRealmFollow } from './realm-model';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
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
	labelPosition: {
		type: String as PropType<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>,
		default: 'top-left',
	},
	noFollow: {
		type: Boolean,
	},
	followOnClick: {
		type: Boolean,
	},
});

const { realm, overlayContent, noSheet, to, labelPosition, noFollow, followOnClick } =
	toRefs(props);

const isHovered = ref(false);
const isProcessing = ref(false);

const mediaItem = computed(() => realm.value.cover);

const labelStyling = computed(() => {
	const pos = labelPosition.value;

	const dash = pos.indexOf('-');
	const vPos = pos.slice(0, dash);
	const hPos = pos.slice(dash + 1, pos.length);

	const result: CSSProperties = {};

	if (vPos === 'top' || vPos === 'bottom') {
		result[vPos] = '8px';
	}
	if (hPos === 'left' || hPos === 'right') {
		result[hPos] = '8px';
	}

	return result;
});

async function onClick(event: Event) {
	if (!followOnClick.value) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	if (isProcessing.value) {
		return;
	}

	isProcessing.value = true;
	await toggleRealmFollow(realm.value, 'fullCard');
	isProcessing.value = false;
}
</script>

<template>
	<div
		class="-card"
		:class="{
			'-hoverable': to || followOnClick,
			'-no-sheet': noSheet,
			['sheet sheet-full sheet-elevate']: !noSheet,
		}"
		@mouseover="isHovered = true"
		@mouseout="isHovered = false"
		@click.capture="onClick"
	>
		<RouterLink v-if="to" class="-link-mask" :to="to" />

		<AppRealmLabel
			class="-label"
			:style="labelStyling"
			:overlay="overlayContent"
			:realm="realm"
		/>

		<AppResponsiveDimensions :ratio="0.75">
			<AppMediaItemBackdrop v-if="mediaItem" :media-item="mediaItem">
				<AppImgResponsive class="-cover-img" :src="mediaItem.mediaserver_url" alt="" />
			</AppMediaItemBackdrop>
		</AppResponsiveDimensions>

		<div
			v-if="!noFollow"
			class="-follow-button"
			:class="{ '-follow-button-overlay': overlayContent }"
		>
			<AppRealmFollowButton
				:realm="realm"
				source="fullCard"
				:block="!overlayContent"
				:overlay="overlayContent"
				:force-hover="followOnClick && isHovered"
				:disabled="isProcessing"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-card
	position: relative
	overflow: hidden
	display: block

.-hoverable
	cursor: pointer

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
