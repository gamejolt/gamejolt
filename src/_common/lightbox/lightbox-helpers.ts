import { computed, onUnmounted, reactive, Ref, ref } from 'vue';
import { MediaItem } from '../media-item/media-item-model';

export const LightboxConfig = {
	// This should match the $-controls-height variable in lightbox.styl
	controlsHeight: 80,

	// This should match the $-button-size variable in lightbox.styl + some extra padding.
	buttonSize: 110,
};

export type LightboxController = ReturnType<typeof createLightbox>;
export type LightboxMediaType = 'image' | 'video' | 'sketchfab';

export interface LightboxMediaModel {
	getModelId(): number;
	getMediaType(): LightboxMediaType;

	// Screenshot/Media Item
	getMediaItem(): MediaItem | undefined;
}

/**
 * Create a lightbox on the page for a particular media source. You can close it
 * with lightbox.close()
 */
export function createLightbox(items: Ref<LightboxMediaModel[]>) {
	const _page = ref(1);
	const isShowing = ref(false);

	const index = computed(() => _page.value - 1);
	const length = computed(() => items.value.length);
	const activeItem = computed(() => {
		if (length.value <= 0) {
			return null;
		}
		return items.value[index.value];
	});

	onUnmounted(() => lightbox.close());

	function gotoPage(newIndex: number) {
		const newPage = newIndex + 1;
		if (newPage > length.value || newPage < 1) {
			return;
		}
		_page.value = newPage;
	}

	const lightbox = reactive({
		index,
		items,
		length,
		activeItem,
		isShowing,
		gotoPage,
		goNext() {
			gotoPage(index.value + 1);
		},
		goPrev() {
			gotoPage(index.value - 1);
		},
		show(newIndex: number | null = null) {
			if (newIndex !== null && newIndex !== index.value) {
				gotoPage(newIndex);
			}
			_assignActiveLightbox(lightbox);
		},
		close() {
			_assignActiveLightbox(null);
			isShowing.value = false;
		},
	});

	return lightbox;
}

const _activeLightbox = ref<null | LightboxController>(null);

function _assignActiveLightbox(tooltip: LightboxController | null) {
	_activeLightbox.value = tooltip;
}

export function getActiveLightbox() {
	return _activeLightbox.value;
}
