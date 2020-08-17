import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import AppLightboxTS from '../../lightbox/lightbox';
import { createLightbox, LightboxMediaSource } from '../../lightbox/lightbox-helpers';
import AppContentMediaItem from '../components/media-item/media-item';
import { ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentRules } from '../content-editor/content-rules';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { AppContentViewerBaseComponent } from './components/base-component';

@Component({
	components: {
		AppContentViewerBaseComponent,
	},
})
export default class AppContentViewer extends Vue implements ContentOwner, LightboxMediaSource {
	@Prop(String)
	source!: string;
	@Prop(propOptional(ContentRules))
	displayRules?: ContentRules;

	data: ContentDocument | null = null;
	hydrator: ContentHydrator = new ContentHydrator();

	private lightbox?: AppLightboxTS;
	activeItem: any | null = null;
	activeIndex: number | null = 0;

	/**
	 * When the lightbox is open and the media items change (removed, edited),
	 * we store the new media items here so the open lightbox won't be affected.
	 */
	private mediaItemsTemp: any[] | null = null;
	/** Media items that can be viewed in the lightbox. */
	mediaItems: any[] = [];

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
		const processedItems: any[] = [];

		this.data.content.forEach(item => {
			if (item.type === 'mediaItem' && !item.attrs.href) {
				const _processedItem = new AppContentMediaItem({
					propsData: {
						mediaItemId: item.attrs.id,
						mediaItemWidth: item.attrs.width,
						mediaItemHeight: item.attrs.height,
						caption: item.attrs.caption,
						align: item.attrs.align,
						href: item.attrs.href,
						isEditing: false,
						owner: this.owner,
					},
				}).mediaItem;

				processedItems.push(_processedItem);
			}
		});

		if (this.lightbox) {
			// Assign to the temp array if the user is currently looking at lightbox items.
			this.mediaItemsTemp = processedItems;
		} else {
			this.mediaItems = processedItems;
			this.mediaItemsTemp = null;
		}
	}

	setActiveItem(item: any) {
		let index = item;
		if (typeof item === 'object') {
			index = this.mediaItems.findIndex(_item => _item.id === item.id);
		}

		this.go(index);
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
	destroyed() {
		this.closeLightbox();
	}

	onItemFullscreen(item: any) {
		if (!this.lightbox) {
			this.setActiveItem(item);
			this.createLightbox();
		}
	}

	getActiveIndex() {
		return this.activeIndex!;
	}

	getItemCount() {
		return this.mediaItems.length;
	}

	getActiveItem() {
		return this.activeItem;
	}

	getItems() {
		return this.mediaItems;
	}

	goNext() {
		if (this.activeIndex === null || this.activeIndex + 1 >= this.mediaItems.length) {
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
		this.activeItem = this.mediaItems[this.activeIndex];
	}

	createLightbox() {
		if (this.lightbox) {
			return;
		}
		this.lightbox = createLightbox(this);
	}

	onLightboxClose() {
		// Move the mediaItems from the temp array to our normal array.
		if (this.mediaItemsTemp) {
			this.mediaItems = this.mediaItemsTemp;
			this.mediaItemsTemp = null;
		}

		this.lightbox = undefined;
		this.activeItem = null;
		this.activeIndex = null;
	}

	private closeLightbox() {
		if (!this.lightbox) {
			return;
		}

		if (this.mediaItemsTemp) {
			this.mediaItems = this.mediaItemsTemp;
			this.mediaItemsTemp = null;
		}

		this.lightbox.close();
		this.lightbox = undefined;
	}
}
