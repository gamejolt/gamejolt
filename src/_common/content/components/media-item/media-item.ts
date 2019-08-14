import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../components/tooltip/tooltip';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import { MediaItem } from '../../../media-item/media-item-model';
import { ContentEditorLinkModal } from '../../content-editor/modals/link/link-modal.service';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';

@Component({
	components: {
		AppBaseContentComponent,
		AppLoading,
	},
	directives: {
		AppTooltip,
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
	resizeObserver!: ResizeObserver;
	computedHeight = this.mediaItemHeight;
	imageLoaded = false;

	$refs!: {
		container: HTMLDivElement;
	};

	get title() {
		if (this.isHydrated && this.hasCaption) {
			return this.caption;
		}
		if (this.isHydrated && this.hasLink) {
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
		return this.mediaItemWidth > 0 ? this.mediaItemWidth + 'px' : 'auto';
	}

	get containerHeight() {
		if (GJ_IS_SSR) {
			return 'auto';
		}
		return this.computedHeight > 0 ? this.computedHeight + 'px' : 'auto';
	}

	get isHydrated() {
		return !!this.mediaItem;
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

	created() {
		this.owner.getHydrator().useData('media-item-id', this.mediaItemId.toString(), data => {
			if (data) {
				this.mediaItem = new MediaItem(data);
			} else {
				this.hasError = true;
			}
		});
	}

	async mounted() {
		// Observe the change to the width property, the be able to instantly recompute the height.
		// We compute the height property of the element based on the computed width to be able to set a proper placeholder.
		this.resizeObserver = new ResizeObserver(() => {
			this.setHeight();
		});
		this.resizeObserver.observe(this.$refs.container);
	}

	onRemoved() {
		this.$emit('removed');
	}

	async onEdit() {
		if (this.hasLink) {
			this.removeLink();
		} else {
			const result = await ContentEditorLinkModal.show(this.href);
			if (result !== undefined) {
				this.$emit('updateAttrs', { href: result.href });
			}
		}
	}

	removeLink() {
		this.$emit('updateAttrs', { href: '' });
	}

	beforeDestroy() {
		this.resizeObserver.disconnect();
	}

	setHeight() {
		const width = this.$refs.container.clientWidth;
		const relWidth = width / this.mediaItemWidth;
		this.computedHeight = this.mediaItemHeight * relWidth;
	}

	onImageLoad() {
		this.imageLoaded = true;
	}

	destroyed() {
		this.resizeObserver.disconnect();
	}
}
