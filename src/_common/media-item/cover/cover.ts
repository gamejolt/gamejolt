import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { AppImgResponsive } from '../../img/responsive/responsive';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import AppMediaItemBackdrop from '../backdrop/backdrop.vue';
import { MediaItem } from '../media-item-model';

import ResizeSensor from 'css-element-queries/src/ResizeSensor';

@Options({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
	},
})
export default class AppMediaItemCover extends Vue {
	@Prop(MediaItem) mediaItem!: MediaItem;
	@Prop(Number) maxHeight?: number;
	@Prop(Boolean) blur?: boolean;

	isLoaded = false;
	height = 'auto';

	@Emit('loaded')
	emitLoaded() {}

	created() {
		if (import.meta.env.SSR) {
			this.recalcHeight();
			this.isLoaded = true;
		}
	}

	mounted() {
		this.recalcHeight();

		new ResizeSensor(this.$el, () => this.recalcHeight());
	}

	@Watch('mediaItem')
	@Watch('maxHeight')
	changes() {
		this.recalcHeight();
	}

	recalcHeight() {
		// Resize counter is just to trigger this getter any time window is
		// resized.
		if (this.mediaItem) {
			if (this.$el) {
				const newDimensions = this.mediaItem.getDimensions(
					Ruler.width(this.$el as HTMLElement),
					undefined,
					{
						force: true,
					}
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
			this.emitLoaded();
		}
	}
}
