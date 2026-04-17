<script lang="ts">
export const REALM_CARD_RATIO = 0.75;
import { computed, CSSProperties, HTMLAttributes, ref } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppRealmFollowButton from '~common/realm/AppRealmFollowButton.vue';
import AppRealmLabel from '~common/realm/AppRealmLabel.vue';
import { $toggleRealmFollow, RealmModel } from '~common/realm/realm-model';
import AppResponsiveDimensions from '~common/responsive-dimensions/AppResponsiveDimensions.vue';
</script>

<script lang="ts" setup>
type Props = {
	realm: RealmModel;
	overlayContent?: boolean;
	noSheet?: boolean;
	to?: RouteLocationRaw;
	linkTarget?: 'whole-card' | 'image';
	labelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	noFollow?: boolean;
	followOnClick?: boolean;
	labelSize?: 'small' | 'tiny';
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick' | 'onDragstart'>;

const {
	realm,
	overlayContent = false,
	noSheet = false,
	to = undefined,
	linkTarget = 'whole-card',
	labelPosition = 'top-left',
	noFollow = false,
	followOnClick = false,
	labelSize = undefined,
} = defineProps<Props>();

const isHovered = ref(false);
const isProcessing = ref(false);

const mediaItem = computed(() => realm.cover);

const labelStyling = computed(() => {
	const pos = labelPosition;

	const dash = pos.indexOf('-');
	const vPos = pos.slice(0, dash);
	const hPos = pos.slice(dash + 1, pos.length);

	const result: CSSProperties = {};
	const margin = '8px';

	if (vPos === 'top' || vPos === 'bottom') {
		result[vPos] = margin;
	}
	if (hPos === 'left' || hPos === 'right') {
		result[hPos] = margin;
	}

	result['max-width'] = `calc(100% - (${margin} * 2))`;

	return result;
});

async function onClick(event: Event) {
	if (!followOnClick) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	if (isProcessing.value) {
		return;
	}

	isProcessing.value = true;
	await $toggleRealmFollow(realm, 'fullCard');
	isProcessing.value = false;
}
</script>

<template>
	<div
		class="-card"
		:class="{
			'-hoverable': linkTarget === 'whole-card' && (to || followOnClick),
			'-no-sheet': noSheet,
			['sheet sheet-full sheet-elevate']: !noSheet,
		}"
		@mouseover="isHovered = true"
		@mouseout="isHovered = false"
		@click.capture="onClick"
	>
		<RouterLink v-if="to && linkTarget === 'whole-card'" class="-link-mask" :to="to" />

		<AppRealmLabel
			class="-label"
			:style="labelStyling"
			:overlay="overlayContent"
			:realm="realm"
			:small="labelSize === 'small'"
			:tiny="labelSize === 'tiny'"
		/>

		<AppResponsiveDimensions :ratio="REALM_CARD_RATIO">
			<component
				:is="to && linkTarget === 'image' ? RouterLink : 'div'"
				class="w-full h-full block"
				:to="to"
			>
				<AppMediaItemBackdrop v-if="mediaItem" :media-item="mediaItem">
					<AppImgResponsive class="-cover-img" :src="mediaItem.mediaserver_url" alt="" />
				</AppMediaItemBackdrop>
			</component>
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
