<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameTrophy } from '../../../../_common/game/trophy/trophy.model';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { BaseTrophy } from '../../../../_common/trophy/base-trophy.model';
import bronzeSecretImage from './bronze-secret.png';
import bronzeImage from './bronze.png';
import goldSecretImage from './gold-secret.png';
import goldImage from './gold.png';
import platinumSecretImage from './platinum-secret.png';
import platinumImage from './platinum.png';
import silverSecretImage from './silver-secret.png';
import silverImage from './silver.png';

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

export function getTrophyImg(trophy: BaseTrophy) {
	// Make sure we don't show thumbnails for secret trophies unless they've
	// been achieved.
	if (trophy.has_thumbnail && trophy.isInfoRevealed) {
		return trophy.img_thumbnail;
	}

	let img = '';
	if (trophy.difficulty === GameTrophy.DIFFICULTY_BRONZE) {
		img = 'bronze';
	} else if (trophy.difficulty === GameTrophy.DIFFICULTY_SILVER) {
		img = 'silver';
	} else if (trophy.difficulty === GameTrophy.DIFFICULTY_GOLD) {
		img = 'gold';
	} else if (trophy.difficulty === GameTrophy.DIFFICULTY_PLATINUM) {
		img = 'platinum';
	}

	if (trophy.secret && !(trophy.is_achieved || trophy.has_perms)) {
		img += '-secret';
	}

	return imgMapping[img];
}

const BaseWidth = 34;
const BaseHeight = 35;

@Options({
	components: {
		AppImgResponsive,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppTrophyThumbnail extends Vue {
	@Prop(Object)
	trophy!: BaseTrophy;

	@Prop(Boolean)
	noTooltip?: boolean;

	@Prop(Boolean)
	noDifficulty?: boolean;

	@Prop(Boolean)
	noHighlight?: boolean;

	thumbWidth = BaseWidth;

	get tooltip() {
		if (this.noTooltip) {
			return '';
		}
		return this.trophy.title;
	}

	get hasThumbnailImg() {
		return this.trophy.has_thumbnail && this.trophy.isInfoRevealed;
	}

	get imgSrc() {
		return getTrophyImg(this.trophy);
	}

	get imgMultiplier() {
		const imgMultiplier = Math.floor(this.thumbWidth / 34);
		return Math.min(2, Math.max(1, imgMultiplier));
	}

	get imgWidth() {
		return BaseWidth * this.imgMultiplier;
	}

	get imgHeight() {
		return BaseHeight * this.imgMultiplier;
	}

	mounted() {
		const thumbElem = this.$refs.thumb as HTMLElement;
		if (thumbElem) {
			this.thumbWidth = thumbElem.offsetWidth - 10;
		}
	}
}
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

<style lang="stylus" src="./thumbnail.styl" scoped></style>
