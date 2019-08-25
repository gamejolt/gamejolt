import { Modal } from '../../../../modal/modal.service';
import AppContentEditorGifModal from './gif-modal.vue';

export type Category = {
	searchterm: string;
	previewGif: string;
	index: number;
};

export type SearchResult = {
	id: string;
	index: number;
	webm: {
		url: string;
		tiny: string;
	};
	mp4: {
		url: string;
		tiny: string;
	};
	preview: string;
	previewGif: string;
	url: string;
	width: number;
	height: number;
};

export class ContentEditorGifModal {
	static categories?: Category[];

	static async show() {
		return await Modal.show<SearchResult>({
			modalId: 'ContentEditorGif',
			component: AppContentEditorGifModal,
			size: 'lg',
			props: {},
		});
	}
}
