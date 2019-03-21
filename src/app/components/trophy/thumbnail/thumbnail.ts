import { GameTrophy } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


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

@Component({
	components: {
		AppImgResponsive,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppTrophyThumbnail extends Vue {
	@Prop(GameTrophy) trophy!: GameTrophy;
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
