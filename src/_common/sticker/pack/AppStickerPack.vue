<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import { formatNumber } from '../../filters/number';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppPopperConfirmWrapper from '../../popper/confirm-wrapper/AppPopperConfirmWrapper.vue';
import { AppTimeAgo } from '../../time/ago/ago';
import { StickerPack } from './pack.model';

interface StickerPackDetails {
	name?: boolean;
	cost?: boolean;
	contents?: boolean;
	expiry?: boolean;
}

type PackDetailsOptions = boolean | StickerPackDetails;

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPack>,
		required: true,
	},
	showDetails: {
		type: [Object, Boolean] as PropType<PackDetailsOptions>,
		default: false,
	},
	count: {
		type: Number,
		default: undefined,
	},
	canClickPack: {
		type: Boolean,
	},
	forceElevate: {
		type: Boolean,
	},
});

const { pack, showDetails, count, canClickPack, forceElevate } = toRefs(props);

const showName = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.name === true;
});

const showCost = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.cost === true;
});

const showCount = computed(() => count?.value !== undefined && count.value > 1);

const showContents = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.contents === true;
});

const showExpiry = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.expiry === true;
});

const emit = defineEmits({
	clickPack: () => true,
});

function onClickPack() {
	if (canClickPack.value) {
		emit('clickPack');
	}
}
</script>

<template>
	<div>
		<div class="-pack">
			<AppAspectRatio :ratio="pack.media_item.aspectRatio" show-overflow>
				<AppPopperConfirmWrapper
					:overlay-radius="12"
					:disabled="!canClickPack"
					@confirm="onClickPack()"
				>
					<AppMediaItemBackdrop
						:class="{ '-pack-hoverable': canClickPack, '-force-elevate': forceElevate }"
						:media-item="pack.media_item"
						radius="lg"
					>
						<AppImgResponsive
							:src="pack.media_item.mediaserver_url"
							alt=""
							draggable="false"
							ondragstart="return false"
						/>
					</AppMediaItemBackdrop>
				</AppPopperConfirmWrapper>
			</AppAspectRatio>

			<div v-if="showCost" class="-cost">
				<span>{{ pack.cost_coins }}</span>
				{{ ' ' }}
				<span>🪙</span>
			</div>

			<div v-if="showCount && count !== undefined" class="-count">
				<span>{{ formatNumber(count) }}</span>
			</div>

			<div v-if="showContents" class="-contents">
				<span>{{ pack.payout_sticker_num }}x</span>
				{{ ' ' }}
				<AppJolticon class="-sticker-icon" icon="sticker-filled" middle />
			</div>

			<!-- TODO(sticker-collections-2) make styling more noticeable? -->
			<div v-if="showExpiry && pack.ends_on" class="-expiry">
				<AppTimeAgo :date="pack.ends_on" is-future />
			</div>
		</div>

		<div v-if="showName" class="-name">{{ pack.name }}</div>
	</div>
</template>

<style lang="stylus" scoped>
.-force-elevate
	elevate-1()

.-pack
	position: relative
	margin: 2px

.-pack-hoverable
	cursor: pointer
	elevate-hover-1()

.-name
	font-size: $font-size-small
	font-weight: 700

.-cost
.-count
.-contents
.-expiry
	change-bg-rgba('0,0,0', 0.54)
	color: white
	elevate-1()
	rounded-corners-lg()
	position: absolute
	padding: 2px 6px
	font-weight: 700
	--offset: -4px
	--inset: 4px

	&
	.jolticon
		font-size: $font-size-tiny

.-cost
	bottom: var(--inset)
	right: var(--offset)

.-count
	top: var(--offset)
	left: var(--offset)
	font-size: $font-size-small

.-contents
	bottom: var(--inset)
	left: var(--offset)

.-expiry
	top: var(--offset)
	right: var(--offset)

.-sticker-icon
	margin: 0
	font-size: $font-size-small
</style>
