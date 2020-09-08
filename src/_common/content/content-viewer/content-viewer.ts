import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import AppLightboxTS from '../../lightbox/lightbox';
import { createLightbox, LightboxMediaSource } from '../../lightbox/lightbox-helpers';
import { MediaItem } from '../../media-item/media-item-model';
import { AppScrollInview } from '../../scroll/inview/inview';
import { ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentRules } from '../content-editor/content-rules';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { AppContentViewerBaseComponent } from './components/base-component';

@Component({
	components: {
		AppContentViewerBaseComponent,
		AppScrollInview,
	},
})
export default class AppContentViewer extends Vue implements ContentOwner, LightboxMediaSource {
	@Prop(String)
	source!: string;
	@Prop(propOptional(ContentRules))
	displayRules?: ContentRules;

	data: ContentDocument | null = null;
	hydrator: ContentHydrator = new ContentHydrator();

	isInview = GJ_IS_SSR;
	mediaItemsNeedRefreshed = true;

	private lightbox?: AppLightboxTS;
	activeItem: any | null = null;
	activeIndex: number | null = 0;

	/** Media items that are children of the ContentOwner */
	mediaItems: MediaItem[] = [];
	/** Media items that are being viewed in the lightbox. */
	lightboxMediaItems: MediaItem[] = [];

	get owner() {
		return this;
	}

	get shouldShowContent() {
		return this.data instanceof ContentDocument;
	}

	get viewerStyleClass() {
		if (!this.data) {
			return '';
		}
		return this.getContext() + '-content';
	}

	created() {
		this.updatedSource();
	}

	getContext() {
		if (this.data) {
			return this.data.context;
		}
		throw new Error('No context assigned to viewer');
	}

	getCapabilities() {
		if (this.data) {
			return ContextCapabilities.getForContext(this.data.context);
		}
		return ContextCapabilities.getEmpty();
	}

	getHydrator() {
		return this.hydrator;
	}

	getContent() {
		return this.data;
	}

	getContentRules() {
		if (this.displayRules) {
			return this.displayRules;
		}

		// Return default values.
		return new ContentRules();
	}

	async getModelId() {
		return 0; // Don't need this in content viewer.
	}

	setContent(content: ContentDocument) {
		this.data = content;
		this.hydrator = new ContentHydrator(content.hydration);

		if (this.isInview) {
			this.mediaItems = this.getMediaItems(this.data);
			this.mediaItemsNeedRefreshed = false;
			return;
		}

		this.mediaItemsNeedRefreshed = true;
	}

	onScrollInview() {
		this.isInview = true;
		if (this.mediaItemsNeedRefreshed && this.data) {
			this.mediaItems = this.getMediaItems(this.data);
			this.mediaItemsNeedRefreshed = false;
		}
	}

	onScrollOutview() {
		this.isInview = false;
	}

	getMediaItems(data: ContentDocument) {
		const items = data.getChildrenByType('mediaItem');
		if (!items.length) {
			return [];
		}

		const processedItems: MediaItem[] = [];

		items.forEach(item => {
			if (item.attrs.href) {
				return;
			}

			let _mediaItem: MediaItem | null = null;
			this.owner.getHydrator().useData('media-item-id', item.attrs.id.toString(), data => {
				if (data) {
					_mediaItem = new MediaItem(data);
				}
			});

			if (_mediaItem) {
				processedItems.push(_mediaItem);
			}
		});

		return processedItems;
	}

	@Watch('source')
	updatedSource() {
		if (this.source) {
			const sourceDoc = ContentDocument.fromJson(this.source);
			this.setContent(sourceDoc);
		} else {
			this.data = null;
		}
	}

	onClickCopy() {
		(navigator as any).clipboard.writeText(this.source);
	}

	// -- Lightbox stuff --
	setActiveItem(item: MediaItem) {
		let index = -1;
		if (item instanceof MediaItem) {
			index = this.lightboxMediaItems.findIndex(_item => _item.id === item.id);
		}

		if (index >= 0) {
			this.go(index);
		}
	}

	destroyed() {
		this.closeLightbox();
	}

	onItemFullscreen(item: any) {
		if (!this.lightbox) {
			this.lightboxMediaItems = this.mediaItems;
			this.setActiveItem(item);
			this.createLightbox();
		}
	}

	getActiveIndex() {
		return this.activeIndex!;
	}

	getItemCount() {
		return this.lightboxMediaItems.length;
	}

	getActiveItem() {
		return this.activeItem;
	}

	getItems() {
		return this.lightboxMediaItems;
	}

	goNext() {
		if (this.activeIndex === null || this.activeIndex + 1 >= this.lightboxMediaItems.length) {
			return;
		}

		this.go(this.activeIndex + 1);
	}

	goPrev() {
		if (this.activeIndex === null || this.activeIndex - 1 < 0) {
			return;
		}

		this.go(this.activeIndex - 1);
	}

	go(index: number) {
		this.activeIndex = index;
		this.activeItem = this.lightboxMediaItems[this.activeIndex];
	}

	createLightbox() {
		if (this.lightbox) {
			return;
		}
		this.lightbox = createLightbox(this);
	}

	onLightboxClose() {
		this.lightboxMediaItems = [];
		this.lightbox = undefined;
		this.activeItem = null;
		this.activeIndex = null;
	}

	private closeLightbox() {
		if (!this.lightbox) {
			return;
		}

		this.lightboxMediaItems = [];
		this.lightbox.close();
		this.lightbox = undefined;
	}
}
