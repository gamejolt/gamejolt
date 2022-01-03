import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import AppLoading from '../../../loading/loading.vue';
import AppMediaItemBackdrop from '../../../media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../media-item/media-item-model';
import { AppResponsiveDimensions } from '../../../responsive-dimensions/responsive-dimensions';
import { ContentEditorLinkModal } from '../../content-editor/modals/link/link-modal.service';
import { ContentOwner } from '../../content-owner';
import AppContentViewerTS from '../../content-viewer/content-viewer';
import AppBaseContentComponent from '../base/base-content-component.vue';

@Options({
	components: {
		AppBaseContentComponent,
		AppLoading,
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppResponsiveDimensions,
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
	imageLoaded = false;

	contentViewerParent: AppContentViewerTS | null = null;

	@Emit('removed') emitRemoved() {}
	@Emit('update-attrs') emitUpdateAttrs(_attrs: Record<string, any>) {}

	declare $refs: {
		container: HTMLDivElement;
	};

	get title() {
		if (this.mediaItem && this.hasCaption) {
			return this.caption;
		}
		if (this.mediaItem && this.hasLink) {
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

	get canFullscreenItem() {
		if (!this.contentViewerParent || !this.mediaItem || this.hasLink) {
			return false;
		}

		return !this.contentViewerParent.disableLightbox;
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
		return !this.imageLoaded && !import.meta.env.SSR;
	}

	get shouldUseMediaserver() {
		// For animated media items (gifs):
		// Always return the direct url because gifs do not get returned by mediaserver.
		return !this.mediaItem?.is_animated && !!this.mediaItem?.mediaserver_url;
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
		// this.contentViewerParent =
		// 	findVueParent<AppContentViewerTS>(this, AppContentViewer) || null;
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

	get maxWidth() {
		const { container } = this.$refs;
		const maxOwnerWidth = this.owner.getContentRules().maxMediaWidth;
		if (maxOwnerWidth !== null) {
			return Math.min(maxOwnerWidth, container ? container.clientWidth : this.mediaItemWidth);
		}

		return this.mediaItemWidth;
	}

	get maxHeight() {
		const maxOwnerHeight = this.owner.getContentRules().maxMediaHeight;
		if (maxOwnerHeight !== null) {
			return Math.min(maxOwnerHeight, this.mediaItemHeight);
		}

		return this.mediaItemHeight;
	}

	removeLink() {
		this.emitUpdateAttrs({ href: '' });
	}

	onImageLoad() {
		this.imageLoaded = true;
	}

	onItemFullscreen() {
		if (!this.canFullscreenItem) {
			return;
		}

		this.contentViewerParent!.onItemFullscreen(this.mediaItem!);
	}
}
