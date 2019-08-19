import { Modal } from '../../../../modal/modal.service';
import AppContentEditorLinkModal from './link-modal.vue';

export type LinkData = {
	href: string;
	title: string;
};

export class ContentEditorLinkModal {
	static async show(selectedText: string) {
		return await Modal.show<LinkData>({
			modalId: 'ContentEditorLink',
			component: AppContentEditorLinkModal,
			size: 'sm',
			props: { selectedText },
		});
	}
}
