import { showModal } from '../../../../modal/modal.service';
import AppContentEditorLinkModal from './link-modal.vue';

export type LinkData = {
	href: string;
	title: string;
};

export class ContentEditorLinkModal {
	static async show(selectedText: string) {
		return await showModal<LinkData>({
			modalId: 'ContentEditorLink',
			component: AppContentEditorLinkModal,
			size: 'sm',
			props: { selectedText },
		});
	}
}

export async function showContentEditorLinkModal(selectedText: string) {
	return await showModal<LinkData>({
		modalId: 'ContentEditorLink',
		component: AppContentEditorLinkModal,
		size: 'sm',
		props: { selectedText },
	});
}
