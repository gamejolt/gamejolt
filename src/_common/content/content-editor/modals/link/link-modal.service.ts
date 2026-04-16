import AppContentEditorLinkModal from '~common/content/content-editor/modals/link/AppContentEditorLinkModal.vue';
import { showModal } from '~common/modal/modal.service';

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
