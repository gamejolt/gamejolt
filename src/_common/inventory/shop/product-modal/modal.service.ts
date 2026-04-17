import { defineAsyncComponent } from 'vue';

import { BackgroundModel } from '~common/background/background.model';
import { showModal } from '~common/modal/modal.service';
import { UserAvatarFrameModel } from '~common/user/user-avatar/frame/frame.model';

interface NewProductOptions {
	product: UserAvatarFrameModel | BackgroundModel;
}

export async function showNewProductModal(options: NewProductOptions) {
	return await showModal<void>({
		modalId: 'NewProductModal',
		component: defineAsyncComponent(
			() => import('~common/inventory/shop/product-modal/AppNewProductModal.vue')
		),
		props: options,
		noBackdrop: true,
		noBackdropClose: true,
		noEscClose: true,
		size: 'full',
	});
}
