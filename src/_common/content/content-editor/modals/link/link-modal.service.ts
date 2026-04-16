import { showModal } from '../../../../modal/modal.service';
import AppContentEditorLinkModal from './AppContentEditorLinkModal.vue';

export type LinkData = {
	href: string;
	title: string;
};

export async function showContentEditorLinkModal(selectedText: string, hasLink = false) {
	return await showModal<LinkData>({
		modalId: 'ContentEditorLink',
		component: AppContentEditorLinkModal,
		size: 'sm',
		props: { selectedText, hasLink },
	});
}
