import { defineAsyncComponent } from 'vue';
import { BackgroundModel } from '../../../background/background.model';
import { showModal } from '../../../modal/modal.service';
import { UserAvatarFrameModel } from '../../../user/user-avatar/frame/frame.model';

interface NewProductOptions {
	product: UserAvatarFrameModel | BackgroundModel;
}

export async function showNewProductModal(options: NewProductOptions) {
	return await showModal<void>({
		modalId: 'NewProductModal',
		component: defineAsyncComponent(() => import('./AppNewProductModal.vue')),
		props: options,
		noBackdrop: true,
		noBackdropClose: true,
		noEscClose: true,
		size: 'full',
	});
}
