import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./cover.html?style=./cover.styl';

import { MediaItem } from '../../../../lib/gj-lib-client/components/media-item/media-item-model';
import { Ruler } from '../../../../lib/gj-lib-client/components/ruler/ruler-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppImgResponsive } from '../../../../lib/gj-lib-client/components/img/responsive/responsive';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppScrollParallax } from '../../../../lib/gj-lib-client/components/scroll/parallax/parallax';

@View
@Component({
	components: {
		AppLoading,
		AppScrollParallax,
		AppImgResponsive,
	},
})
export class AppMediaItemCover extends Vue
{
	@Prop( MediaItem ) mediaItem: MediaItem;
	@Prop( { type: Boolean, default: true } ) shouldParallax?: boolean;
	@Prop( Number ) maxHeight?: number;

	isLoaded = false;
	height = 'auto';

	resize$ = Screen.resizeChanges.subscribe( () => this.recalcHeight() );

	created() { this.recalcHeight(); }
	mounted() { this.recalcHeight(); }
	@Watch( 'mediaItem' ) mediaItemWatch() { this.recalcHeight(); }
	@Watch( 'maxHeight' ) maxHeightWatch() { this.recalcHeight(); }

	destroyed()
	{
		this.resize$.unsubscribe();
	}

	recalcHeight()
	{
		// Resize counter is just to trigger this getter any time window is
		// resized.
		if ( this.mediaItem ) {
			if ( this.$el ) {
				const newDimensions = this.mediaItem.getDimensions(
					Ruler.width( this.$el ),
					undefined,
					{ force: true },
				);

				// We extend the header to the right and left by 20% on XS since
				// the screen is so small. This makes sure that we also
				// calculate the height larger.
				if ( Screen.isXs ) {
					newDimensions.height *= 1.4;
				}

				if ( this.maxHeight && newDimensions.height > this.maxHeight ) {
					newDimensions.height = this.maxHeight;
				}

				this.height = newDimensions.height + 'px';
				return;
			}

			// If no element yet, set the height to auto.
			this.height = 'auto';
			return;
		}

		// Make sure it's collapsed if there is no header.
		this.height = '0';
	}

	onLoadChange( isLoaded: boolean )
	{
		this.isLoaded = isLoaded;

		if ( this.isLoaded ) {
			this.$emit( 'loaded' );
			this.recalcHeight();
		}
	}
}
