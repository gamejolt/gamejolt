import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import AppLightboxTS from '../../lightbox/lightbox';
import { createLightbox, LightboxMediaSource } from '../../lightbox/lightbox-helpers';
import { MediaItem } from '../../media-item/media-item-model';
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
	@Prop(propRequired(String)) source!: string;
	@Prop(propOptional(Boolean, false)) disableLightbox!: boolean;
	@Prop(propOptional(ContentRules)) displayRules?: ContentRules;

	data: ContentDocument | null = null;
	hydrator: ContentHydrator = new ContentHydrator();

	private lightbox?: AppLightboxTS;
	lightboxMediaItem: MediaItem | null = null;

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

	destroyed() {
		this.closeLightbox();
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
	onItemFullscreen(item: MediaItem) {
		if (!this.lightbox) {
			this.lightboxMediaItem = item;
			this.createLightbox();
		}
	}

	getActiveIndex() {
		return 0;
	}

	getItemCount() {
		return this.lightboxMediaItem ? 1 : 0;
	}

	getActiveItem(): any {
		return this.lightboxMediaItem;
	}

	getItems(): any[] {
		return this.lightboxMediaItem ? [this.lightboxMediaItem] : [];
	}

	// unused, needed for LightboxMediaSource
	goNext() {}
	goPrev() {}

	createLightbox() {
		if (this.lightbox) {
			return;
		}
		this.lightbox = createLightbox(this);
	}

	onLightboxClose() {
		this.lightbox = undefined;
		this.lightboxMediaItem = null;
	}

	private closeLightbox() {
		if (!this.lightbox) {
			return;
		}

		this.lightbox.close();
	}
}
