<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
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
	canClickPack: {
		type: Boolean,
	},
	forceElevate: {
		type: Boolean,
	},
});

const { pack, showDetails, canClickPack, forceElevate } = toRefs(props);

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
	<div class="-sticker-pack">
		<AppAspectRatio :ratio="pack.media_item.aspectRatio" show-overflow>
			<AppMediaItemBackdrop
				:class="{ '-pack-hoverable': canClickPack, '-force-elevate': forceElevate }"
				:media-item="pack.media_item"
				radius="lg"
				@click="onClickPack"
			>
				<AppImgResponsive
					:src="pack.media_item.mediaserver_url"
					alt=""
					draggable="false"
					ondragstart="return false"
				/>
			</AppMediaItemBackdrop>
		</AppAspectRatio>

		<!-- TODO(sticker-collections-2) Change some of these to be bubbles in the corners of the pack. -->
		<div v-if="showDetails" class="-details">
			<div v-if="showName" class="-name">{{ pack.name }}</div>
			<div v-if="showCost">
				<span>{{ pack.cost_coins }}</span>
				{{ ' ' }}
				<span>🪙</span>
			</div>
			<!-- TODO(sticker-collections-2) Put this as an overlay above the pack? -->
			<div v-if="showContents">
				<span>{{ pack.payout_sticker_num }}x</span>
				{{ ' ' }}
				<AppJolticon class="-sticker-icon" icon="sticker-filled" middle />
			</div>
			<div v-if="showExpiry && pack.ends_on">
				<AppTimeAgo :date="pack.ends_on" is-future />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-force-elevate
	elevate-1()

.-pack-hoverable
	cursor: pointer
	elevate-hover-1()

.-details
	font-size: $font-size-small
	font-weight: 600

.-name
	font-weight: 700

.-sticker-icon
	margin: 0
	font-size: $font-size-small
</style>
