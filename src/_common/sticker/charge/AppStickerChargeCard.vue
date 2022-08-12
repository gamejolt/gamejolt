<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';
import { illChargeOrbEmpty } from '../../../app/img/ill/illustrations';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppAnimSlideshow from '../../animation/AppAnimSlideshow.vue';
import { sheetChargeOrb } from '../../animation/slideshow/sheets';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import { setStickerDrawerOpen, useStickerStore } from '../sticker-store';
import { StickerChargeModal } from './modal/modal.service';

defineProps({
	elevate: {
		type: Boolean,
	},
});
const stickerStore = useStickerStore();
const { currentCharge, chargeLimit, canChargeSticker } = stickerStore;

const gridStyling = computed<CSSProperties>(() => {
	const orbMaxSize = `${28}px`;

	return {
		height: orbMaxSize,
		gridTemplateColumns: `repeat(${chargeLimit.value}, minmax(0, ${orbMaxSize}))`,
		alignContent: 'center',
	};
});

function onClick() {
	StickerChargeModal.show();
	setStickerDrawerOpen(stickerStore, false, null);
}
</script>

<template>
	<div class="sticker-charge-card" :class="{ '-elevate': elevate }" @click="onClick()">
		<div class="-content">
			<span class="-charge">
				<AppTranslate>Charge</AppTranslate>

				<AppJolticon icon="help-circle" />
			</span>

			<AppAnimElectricity class="-orbs" :style="gridStyling" :disabled="!canChargeSticker">
				<AppAspectRatio v-for="i of chargeLimit" :key="i" :ratio="1">
					<img
						v-if="currentCharge < i"
						class="-orb-empty"
						:src="illChargeOrbEmpty.path"
						draggable="false"
						alt=""
					/>
					<AppAnimSlideshow v-else :sheet="sheetChargeOrb" />
				</AppAspectRatio>
			</AppAnimElectricity>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-charge-card
	rounded-corners()
	change-bg(bg-backdrop)
	padding: 16px
	cursor: pointer

	&.-elevate
		elevate-2()

.-content
	display: inline-flex
	align-items: center

.-charge
	margin-right: 24px
	font-family: $font-family-heading
	font-size: 17px
	white-space: nowrap
	display: inline-flex
	align-items: center

	::v-deep(.jolticon)
		font-size: 14px
		margin: 0 0 0 4px
		color: var(--theme-fg-muted)

.-orbs
	flex: auto
	display: inline-grid
	gap: 0 6px
	min-width: 0

.-orb-empty
	width: 100%
	height: 100%
	opacity: 0.25
	vertical-align: top
</style>
