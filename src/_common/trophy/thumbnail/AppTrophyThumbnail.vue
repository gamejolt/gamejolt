<script lang="ts">
import { computed, type HTMLAttributes, onMounted, ref, useTemplateRef } from 'vue';

import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { BaseTrophyModel } from '~common/trophy/base-trophy.model';
import {
	BaseTrophyDifficultyBronze,
	BaseTrophyDifficultyGold,
	BaseTrophyDifficultyPlatinum,
	BaseTrophyDifficultySilver,
} from '~common/trophy/base-trophy.model';
import bronzeImage from '~common/trophy/thumbnail/bronze.png';
import bronzeSecretImage from '~common/trophy/thumbnail/bronze-secret.png';
import goldImage from '~common/trophy/thumbnail/gold.png';
import goldSecretImage from '~common/trophy/thumbnail/gold-secret.png';
import platinumImage from '~common/trophy/thumbnail/platinum.png';
import platinumSecretImage from '~common/trophy/thumbnail/platinum-secret.png';
import silverImage from '~common/trophy/thumbnail/silver.png';
import silverSecretImage from '~common/trophy/thumbnail/silver-secret.png';

const imgMapping: any = {
	bronze: bronzeImage,
	'bronze-secret': bronzeSecretImage,
	silver: silverImage,
	'silver-secret': silverSecretImage,
	gold: goldImage,
	'gold-secret': goldSecretImage,
	platinum: platinumImage,
	'platinum-secret': platinumSecretImage,
};

export function getTrophyImg(trophy: BaseTrophyModel) {
	// Make sure we don't show thumbnails for secret trophies unless they've
	// been achieved.
	if (trophy.has_thumbnail && trophy.isInfoRevealed) {
		return trophy.img_thumbnail;
	}

	let img = '';
	if (trophy.difficulty === BaseTrophyDifficultyBronze) {
		img = 'bronze';
	} else if (trophy.difficulty === BaseTrophyDifficultySilver) {
		img = 'silver';
	} else if (trophy.difficulty === BaseTrophyDifficultyGold) {
		img = 'gold';
	} else if (trophy.difficulty === BaseTrophyDifficultyPlatinum) {
		img = 'platinum';
	}

	if (trophy.secret && !(trophy.is_achieved || trophy.has_perms)) {
		img += '-secret';
	}

	return imgMapping[img];
}

const BaseWidth = 34;
const BaseHeight = 35;
</script>

<script lang="ts" setup>
type Props = {
	trophy: BaseTrophyModel;
	noTooltip?: boolean;
	noDifficulty?: boolean;
	noHighlight?: boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const {
	trophy,
	noTooltip = false,
	noDifficulty = false,
	noHighlight = false,
} = defineProps<Props>();

const thumbElem = useTemplateRef('thumb');
const thumbWidth = ref(BaseWidth);

const tooltip = computed(() => {
	if (noTooltip) {
		return '';
	}
	return trophy.title;
});

const hasThumbnailImg = computed(() => trophy.has_thumbnail && trophy.isInfoRevealed);

const imgSrc = computed(() => getTrophyImg(trophy));

const imgMultiplier = computed(() => {
	const val = Math.floor(thumbWidth.value / 34);
	return Math.min(2, Math.max(1, val));
});

const imgWidth = computed(() => BaseWidth * imgMultiplier.value);
const imgHeight = computed(() => BaseHeight * imgMultiplier.value);

onMounted(() => {
	if (thumbElem.value) {
		thumbWidth.value = thumbElem.value.offsetWidth - 10;
	}
});
</script>

<template>
	<div
		v-app-tooltip="tooltip"
		class="trophy-thumbnail"
		:class="{
			'trophy-thumbnail-achieved': trophy.is_achieved && !noHighlight,
		}"
	>
		<div ref="thumb" class="trophy-thumbnail-img">
			<div class="trophy-thumbnail-img-inner">
				<AppImgResponsive v-if="hasThumbnailImg" :src="imgSrc" />
				<img
					v-else
					:class="`trophy-thumbnail-img-${imgMultiplier}x`"
					:style="{
						width: imgWidth + 'px',
						height: imgHeight + 'px',
					}"
					:src="imgSrc"
				/>
			</div>
		</div>

		<span v-if="!noDifficulty" class="trophy-thumbnail-difficulty">
			{{ trophy.difficultyLabel }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.trophy-thumbnail
	rounded-corners-lg()
	padding: 3px
	background-color: $black
	text-align: center

.trophy-thumbnail-img
	position: relative
	height: 0
	padding-top: 100%
	overflow: hidden
	border-radius: $border-radius-large - 2px

.trophy-thumbnail-img-inner
	change-bg('dark')
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

	> .img-responsive
		display: block
		width: 100%

.trophy-thumbnail-img-1x
.trophy-thumbnail-img-2x
	position: absolute
	top: 50%
	left: 50%

.trophy-thumbnail-img-1x
	margin-left: -(34px / 2)
	margin-top: -(35px / 2)

.trophy-thumbnail-img-2x
	margin-left: -(34px)
	margin-top: -(35px)

.trophy-thumbnail-difficulty
	display: block
	padding-top: 3px // match the border
	font-size: $font-size-tiny
	text-align: center
	text-transform: uppercase
	color: $dark-theme-fg

.trophy-thumbnail-achieved
	change-bg('highlight')

	.trophy-thumbnail-difficulty
		theme-prop('color', 'highlight-fg')
</style>
