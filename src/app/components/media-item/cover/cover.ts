import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./cover.html?style=./cover.styl';

import { MediaItem } from '../../../../lib/gj-lib-client/components/media-item/media-item-model';
import { Ruler } from '../../../../lib/gj-lib-client/components/ruler/ruler-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppImgResponsive } from '../../../../lib/gj-lib-client/components/img/responsive/responsive';

@View
@Component({
	components: {
		AppImgResponsive,
	},
})
export class AppMediaItemCover extends Vue {
	@Prop(MediaItem) mediaItem: MediaItem;

	@Prop(Number) maxHeight?: number;

	isLoaded = false;
	height = 'auto';

	private resize$: Subscription | undefined;

	created() {
		if (GJ_IS_SSR) {
			this.recalcHeight();
		}
	}

	mounted() {
		this.recalcHeight();
		this.resize$ = Screen.resizeChanges.subscribe(() => this.recalcHeight());
	}

	@Watch('mediaItem')
	mediaItemWatch() {
		this.recalcHeight();
	}

	@Watch('maxHeight')
	changes() {
		this.recalcHeight();
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	recalcHeight() {
		// Resize counter is just to trigger this getter any time window is
		// resized.
		if (this.mediaItem) {
			if (this.$el) {
				const newDimensions = this.mediaItem.getDimensions(
					Ruler.width(this.$el),
					undefined,
					{ force: true }
				);

				// We extend the header to the right and left by 20% on XS since
				// the screen is so small. This makes sure that we also
				// calculate the height larger.
				if (Screen.isXs) {
					newDimensions.height *= 1.4;
				}

				if (this.maxHeight && newDimensions.height > this.maxHeight) {
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

	onLoadChange(isLoaded: boolean) {
		this.isLoaded = isLoaded;

		if (this.isLoaded) {
			this.$emit('loaded');
		}
	}
}
