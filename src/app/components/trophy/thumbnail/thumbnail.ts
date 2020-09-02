import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameTrophy } from '../../../../_common/game/trophy/trophy.model';
import { AppImgResponsive } from '../../../../_common/img/responsive/responsive';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { BaseTrophy } from '../../../../_common/trophy/base-trophy.model';

const imgMapping: any = {
	bronze: require('./bronze.png'),
	'bronze-secret': require('./bronze-secret.png'),
	silver: require('./silver.png'),
	'silver-secret': require('./silver-secret.png'),
	gold: require('./gold.png'),
	'gold-secret': require('./gold-secret.png'),
	platinum: require('./platinum.png'),
	'platinum-secret': require('./platinum-secret.png'),
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

@Component({
	components: {
		AppImgResponsive,
	},
	directives: {
		AppTooltip,
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
