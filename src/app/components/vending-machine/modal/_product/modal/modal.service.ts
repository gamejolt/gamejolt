import { defineAsyncComponent } from 'vue';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { showModal } from '../../../../../../_common/modal/modal.service';
import { UserAvatarFrameModel } from '../../../../../../_common/user/user-avatar/frame/frame.model';

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
