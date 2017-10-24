import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { GameTrophy } from '../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppImgResponsive } from '../../../../lib/gj-lib-client/components/img/responsive/responsive';

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

const BaseWidth = 34;
const BaseHeight = 35;

@View
@Component({
	components: {
		AppImgResponsive,
	},
	directives: {
		AppTooltip,
	},
})
export class AppTrophyThumbnail extends Vue {
	@Prop(GameTrophy) trophy: GameTrophy;
	@Prop(Boolean) isAchieved?: boolean;

	thumbWidth = BaseWidth;

	get hasThumbnailImg() {
		return (
			this.trophy.has_thumbnail && (!this.trophy.secret || this.isAchieved || this.trophy.is_owner)
		);
	}

	get imgSrc() {
		// Make sure we don't show thumbnails for secret trophies unless they've
		// been achieved.
		if (this.hasThumbnailImg) {
			return this.trophy.img_thumbnail;
		} else {
			let img = '';
			if (this.trophy.difficulty === GameTrophy.DIFFICULTY_BRONZE) {
				img = 'bronze';
			} else if (this.trophy.difficulty === GameTrophy.DIFFICULTY_SILVER) {
				img = 'silver';
			} else if (this.trophy.difficulty === GameTrophy.DIFFICULTY_GOLD) {
				img = 'gold';
			} else if (this.trophy.difficulty === GameTrophy.DIFFICULTY_PLATINUM) {
				img = 'platinum';
			}

			if (this.trophy.secret && !this.isAchieved) {
				img += '-secret';
			}

			return imgMapping[img];
		}
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
