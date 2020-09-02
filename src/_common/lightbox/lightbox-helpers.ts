import { MediaItem } from '../media-item/media-item-model';
import AppLightboxTS from './lightbox';
import AppLightbox from './lightbox.vue';

export const LightboxConfig = {
	// This should match the $-controls-height variable in lightbox.styl
	controlsHeight: 80,

	// This should match the $-button-size variable in lightbox.styl + some extra padding.
	buttonSize: 110,
};

export interface LightboxMediaSource {
	goNext(): void;
	goPrev(): void;
	onLightboxClose?(): void;
	getActiveIndex(): number;
	getActiveItem(): LightboxMediaModel;
	getItemCount(): number;
	getItems(): LightboxMediaModel[];
}

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
export function createLightbox(mediaSource: LightboxMediaSource) {
	const elem = document.createElement('div');
	window.document.body.appendChild(elem);

	const lightbox = new AppLightbox({
		propsData: {
			mediaSource,
		},
	}) as AppLightboxTS;

	lightbox.$mount(elem);
	return lightbox;
}
