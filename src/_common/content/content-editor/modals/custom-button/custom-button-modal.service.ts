import { showModal } from '../../../../modal/modal.service';
import AppContentEditorCustomButtonModal from './AppContentEditorCustomButtonModal.vue';

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
