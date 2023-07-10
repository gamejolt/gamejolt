import { defineAsyncComponent } from 'vue';
import { Background } from '../../../../../../_common/background/background.model';
import { showModal } from '../../../../../../_common/modal/modal.service';
import { UserAvatarFrame } from '../../../../../../_common/user/user-avatar/frame/frame.model';

interface NewProductOptions {
	product: UserAvatarFrame | Background;
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
