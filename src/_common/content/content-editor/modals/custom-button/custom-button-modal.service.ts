import AppContentEditorCustomButtonModal from '~common/content/content-editor/modals/custom-button/AppContentEditorCustomButtonModal.vue';
import { showModal } from '~common/modal/modal.service';

export type CustomButtonData = {
	customButtonId: string;
};

export async function showContentEditorCustomButtonModal(customButtonId: string) {
	return await showModal<CustomButtonData>({
		modalId: 'ContentEditorCustomButton',
		component: AppContentEditorCustomButtonModal,
		props: {
			customButtonId,
		},
		size: 'sm',
	});
}
