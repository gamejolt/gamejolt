import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export class ArchiveFileSelectorModal {
	static async show(
		gameId: number,
		packageId: number,
		releaseId: number,
		buildId: number,
		primaryFileId: number,
		platform: string
	) {
		return await Modal.show<string>({
			component: () => asyncComponentLoader(import('./archive-file-selector-modal')),
			props: { gameId, packageId, releaseId, buildId, primaryFileId, platform },
		});
	}
}
