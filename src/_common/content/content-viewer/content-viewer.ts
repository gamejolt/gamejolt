import { toRef } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { createLightbox } from '../../lightbox/lightbox-helpers';
import { MediaItem } from '../../media-item/media-item-model';
import { ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentRules } from '../content-editor/content-rules';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { AppContentViewerBaseComponent } from './components/base-component';

@Options({
	components: {
		AppContentViewerBaseComponent,
	},
})
export default class AppContentViewer extends Vue implements ContentOwner {
	@Prop(propRequired(String)) source!: string;
	@Prop(propOptional(Boolean, false)) disableLightbox!: boolean;
	@Prop(propOptional(ContentRules)) displayRules?: ContentRules;

	doc: ContentDocument | null = null;
	hydrator: ContentHydrator = new ContentHydrator();
	lightboxMediaItem: MediaItem | null = null;

	lightbox = setup(() => {
		return createLightbox(toRef(this, 'items'));
	});

	get items() {
		return this.lightboxMediaItem ? [this.lightboxMediaItem] : [];
	}

	get owner() {
		return this;
	}

	get viewerStyleClass() {
		if (!this.doc) {
			return '';
		}
		return this.getContext() + '-content';
	}

	created() {
		this.updatedSource();
	}

	getContext() {
		if (this.doc) {
			return this.doc.context;
		}
		throw new Error('No context assigned to viewer');
	}

	getCapabilities() {
		if (this.doc) {
			return ContextCapabilities.getForContext(this.doc.context);
		}
		return ContextCapabilities.getEmpty();
	}

	getHydrator() {
		return this.hydrator;
	}

	getContent() {
		return this.doc;
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
		this.doc = content;
		this.hydrator = new ContentHydrator(content.hydration);
	}

	@Watch('source')
	updatedSource() {
		if (this.source) {
			const sourceDoc = ContentDocument.fromJson(this.source);
			this.setContent(sourceDoc);
		} else {
			this.doc = null;
		}
	}

	onClickCopy() {
		(navigator as any).clipboard.writeText(this.source);
	}

	// -- Lightbox stuff --
	onItemFullscreen(item: MediaItem) {
		this.lightboxMediaItem = item;
		this.lightbox.show();
	}
}
