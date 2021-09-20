import { asyncComponentLoader } from '../../../../utils/utils';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Modal } from '../../../../_common/modal/modal.service';
import { Translate } from '../../../../_common/translate/translate.service';

interface FiresidePublishModalOptions {
	fireside: Fireside;
}

export type FiresidePublishModalResult = {
	doPublish: boolean;
	autoFeature: boolean;
};

export class FiresidePublishModal {
	static async show(options: FiresidePublishModalOptions) {
		const { fireside } = options;

		// Show simple "yes/no" confirm modal if they can't change anything regarding the community link.
		if (!fireside.community?.hasPerms('community-firesides')) {
			const result = await ModalConfirm.show(
				Translate.$gettext(`Do you want to publish this fireside for the world to see?`)
			);
			return {
				doPublish: result === true,
				autoFeature: false,
			} as FiresidePublishModalResult;
		}

		// Show a more complex modal for community options before publishing.
		return await Modal.show<FiresidePublishModalResult>({
			modalId: 'FiresidePublish',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresidePublishModal" */ './publish-modal.vue')
				),
			props: {
				fireside,
			},
			size: 'sm',
		});
	}
}
