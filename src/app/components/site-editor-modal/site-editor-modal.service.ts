import { Modal } from '../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import AppSiteEditorModal from './site-editor-modal';

export class SiteEditorModal {
	/**
	 * This returns the actual editor component instead of the resolved value
	 * from the modal.
	 */
	static async show(siteId: number) {
		return new Promise<AppSiteEditorModal>(resolve => {
			Modal.show<void>({
				component: () => asyncComponentLoader(import('./site-editor-modal')),
				props: { siteId, onInit: resolve },
				noBackdrop: true,
				noBackdropClose: true,
				noEscClose: true,
			});
		});
	}
}
