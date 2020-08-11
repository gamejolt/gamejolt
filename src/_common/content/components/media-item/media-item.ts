import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { findVueParent } from '../../../../utils/vue';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import AppLoading from '../../../loading/loading.vue';
import AppMediaItemBackdrop from '../../../media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../media-item/media-item-model';
import { AppObserveDimensions } from '../../../observe-dimensions/observe-dimensions.directive';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { ContentEditorLinkModal } from '../../content-editor/modals/link/link-modal.service';
import { ContentOwner } from '../../content-owner';
import AppContentViewerTS from '../../content-viewer/content-viewer';
import AppContentViewer from '../../content-viewer/content-viewer.vue';
import AppBaseContentComponent from '../base/base-content-component.vue';

@Component({
	components: {
		AppBaseContentComponent,
		AppLoading,
		AppImgResponsive,
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppContentMediaItem extends Vue {
	@Prop(Number)
	mediaItemId!: number;

	@Prop(Number)
	mediaItemWidth!: number;

	@Prop(Number)
	mediaItemHeight!: number;

	@Prop(String)
	caption!: string;

	@Prop(String)
	align!: string;

	@Prop(String)
	href!: string;

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	mediaItem: MediaItem | null = null;
	hasError = false;
	computedWidth = this.mediaItemWidth;
	computedHeight = this.mediaItemHeight;
	imageLoaded = false;

	contentViewerParent: AppContentViewerTS | null = null;

	@Emit('removed') emitRemoved() {}
	@Emit('update-attrs') emitUpdateAttrs(_attrs: Record<string, any>) {}

	$refs!: {
		container: HTMLDivElement;
	};

	get title() {
		if (!!this.mediaItem && this.hasCaption) {
			return this.caption;
		}
		if (!!this.mediaItem && this.hasLink) {
			return this.displayHref;
		}
		if (this.mediaItem instanceof MediaItem) {
			let filename = this.mediaItem.filename;
			// If possible, remove the hash from the filename.
			// The filename is matching the pattern 'filename-8chrhere.ext'
			const hashRegex = /^.+?(-[a-z0-9]{8}(\.[a-z]{1,5}))$/i;
			const results = hashRegex.exec(filename);
			if (results !== null && results.length === 3) {
				// Match for the hash, remove it, and append the file ext.
				filename = filename.substr(0, filename.length - results[1].length) + results[2];
			}
			return filename;
		}
		return '';
	}

	get hasCaption() {
		return !!this.caption;
	}

	get containerWidth() {
		// Always have SSR fullwidth the image. We never let SSR calculate the height of the container based on the width.
		if (GJ_IS_SSR) {
			return '100%';
		}
		return this.computedWidth > 0 ? this.computedWidth + 'px' : 'auto';
	}

	get containerHeight() {
		if (GJ_IS_SSR) {
			return 'auto';
		}
		return this.computedHeight > 0 ? this.computedHeight + 'px' : 'auto';
	}

	get itemAlignment() {
		switch (this.align) {
			case 'left':
				return 'flex-start';
			case 'right':
				return 'flex-end';
		}
		return 'center';
	}

	get hasLink() {
		return typeof this.href === 'string' && this.href.length > 0;
	}

	get displayHref() {
		let text = this.href;
		if (text.startsWith('//')) {
			text = text.substr(2);
		}
		if (text.length > 30) {
			text = text.substr(0, 30) + '…';
		}
		return text;
	}

	get shouldShowPlaceholder() {
		// Never show the placeholder for SSR, because the events to clear it are not fired.
		return !this.imageLoaded && !GJ_IS_SSR;
	}

	get shouldUseMediaserver() {
		// For animated media items (gifs):
		// Always return the direct url because gifs do not get returned by mediaserver.
		return !this.mediaItem?.is_animated && !!this.mediaItem?.mediaserver_url;
	}

	get shouldShowFullscreenOption() {
		if (this.mediaItem && !this.href) {
			return this.mediaItem.height >= 100 && this.mediaItem.width >= 100;
		}
		return false;
	}

	created() {
		this.owner.getHydrator().useData('media-item-id', this.mediaItemId.toString(), data => {
			if (data) {
				this.mediaItem = new MediaItem(data);
			} else {
				this.hasError = true;
			}
		});
	}

	mounted() {
		this.computeSize();
		this.contentViewerParent = findVueParent(this, AppContentViewer) as AppContentViewerTS;
	}

	onRemoved() {
		this.emitRemoved();
	}

	async onEdit() {
		if (this.hasLink) {
			this.removeLink();
		} else {
			const result = await ContentEditorLinkModal.show(this.href);
			if (result !== undefined) {
				this.emitUpdateAttrs({ href: result.href });
			}
		}
	}

	removeLink() {
		this.emitUpdateAttrs({ href: '' });
	}

	computeSize() {
		const maxContainerWidth = this.$refs.container.getBoundingClientRect().width;
		let maxWidth = this.owner.getContentRules().maxMediaWidth;
		if (maxWidth === null || maxWidth > maxContainerWidth) {
			maxWidth = maxContainerWidth;
		}
		const maxHeight = this.owner.getContentRules().maxMediaHeight;

		const size = computeSize(this.mediaItemWidth, this.mediaItemHeight, maxWidth, maxHeight);

		this.computedWidth = size.width;
		this.computedHeight = size.height;
	}

	onImageLoad() {
		this.imageLoaded = true;
	}

	onItemFullscreen() {
		if (this.contentViewerParent && !!this.mediaItem && !this.hasLink) {
			this.contentViewerParent.onItemFullscreen(this.mediaItem);
		}
	}
}

/**
 * Function that computes an output size (width/height) given the input parameters.
 * Base width/height are the actual width/height of the object to be displayed.
 * Max width/height are the maximum allowed width/height of the object.
 */
export function computeSize(
	baseWidth: number,
	baseHeight: number,
	maxWidth: number | null,
	maxHeight: number | null
) {
	let width = baseWidth;
	let height = baseHeight;

	let relativeWidth = null;
	let relativeHeight = null;

	if (maxWidth !== null && width > maxWidth) {
		width = maxWidth;
		relativeWidth = width / baseWidth;
	}
	if (maxHeight !== null && height > maxHeight) {
		height = maxHeight;
		relativeHeight = height / baseHeight;
	}

	if (relativeWidth !== null && relativeHeight !== null) {
		// Object is larger than both max width and max height.
		const scaledWidth = baseWidth * (maxHeight! / baseHeight);
		const scaledHeight = baseHeight * (maxWidth! / baseWidth);
		if (scaledWidth > scaledHeight) {
			width = maxWidth!;
			height = scaledHeight;
		} else {
			width = scaledWidth;
			height = maxHeight!;
		}
	} else if (relativeWidth !== null) {
		// Object is only larger than max width.
		height *= relativeWidth;
	} else if (relativeHeight !== null) {
		// Object is only larger than max height.
		width *= relativeHeight;
	}

	return {
		width,
		height,
	};
}
