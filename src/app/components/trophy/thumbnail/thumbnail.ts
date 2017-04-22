import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { GameTrophy } from '../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';

const imgMapping: any = {
	'bronze': require( './bronze.png' ),
	'bronze-secret': require( './bronze-secret.png' ),
	'silver': require( './silver.png' ),
	'silver-secret': require( './silver-secret.png' ),
	'gold': require( './gold.png' ),
	'gold-secret': require( './gold-secret.png' ),
	'platinum': require( './platinum.png' ),
	'platinum-secret': require( './platinum-secret.png' ),
};

const BaseWidth = 34;
const BaseHeight = 35;

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppTrophyThumbnail extends Vue
{
	@Prop( GameTrophy ) trophy: GameTrophy;
	@Prop( Boolean ) isAchieved?: boolean;

	hasThumbnailImg = false;
	imgSrc = '';
	imgWidth = BaseWidth;
	imgHeight = BaseHeight;
	imgMultiplier = 1;

	isLoaded = false;

	created()
	{
		// Make sure we don't show thumbnails for secret trophies unless they've
		// been achieved.
		if ( this.trophy.has_thumbnail && (!this.trophy.secret || this.isAchieved) ) {
			this.imgSrc = this.trophy.img_thumbnail;
			this.hasThumbnailImg = true;
			this.isLoaded = true;
		}
		else {
			let img = '';
			if ( this.trophy.difficulty === GameTrophy.DIFFICULTY_BRONZE ) {
				img = 'bronze';
			}
			else if ( this.trophy.difficulty === GameTrophy.DIFFICULTY_SILVER ) {
				img = 'silver';
			}
			else if ( this.trophy.difficulty === GameTrophy.DIFFICULTY_GOLD ) {
				img = 'gold';
			}
			else if ( this.trophy.difficulty === GameTrophy.DIFFICULTY_PLATINUM ) {
				img = 'platinum';
			}

			if ( this.trophy.secret && !this.isAchieved ) {
				img += '-secret';
			}

			this.hasThumbnailImg = false;
			this.imgSrc = imgMapping[ img ];

			/**
			 * We delay this because it's more costly to calculate widths and stuff
			 * while things are moving around. Since it's most likely that they just
			 * landed on a new page, there may be things shifting around still. Let's calculate
			 * after to keep it fast.
			 */
			// TODO: This doesn't get updated when the window size changes.
			setTimeout( () =>
			{
				this.processWidth();
				this.isLoaded = true;
			}, 1000 );
		}
	}

	/**
	 * We do this because of stupid pixel icons!
	 * We have to figure out which size to show for the thumbnails.
	 */
	private processWidth()
	{
		const thumbElem = this.$refs.thumb as HTMLElement;

		if ( thumbElem ) {
			const width = thumbElem.offsetWidth - 10;

			this.imgMultiplier = Math.floor( width / 34 );
			this.imgMultiplier = Math.min( 2, Math.max( 1, this.imgMultiplier ) );

			this.imgWidth = (BaseWidth * this.imgMultiplier);
			this.imgHeight = (BaseHeight * this.imgMultiplier);
		}
	}
}
