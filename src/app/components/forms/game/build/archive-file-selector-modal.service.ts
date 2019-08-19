import { Modal } from '../../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../../utils/utils';

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
			modalId: 'ArchiveFileSelector',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "ArchiveFileSelectorModal" */ './archive-file-selector-modal.vue'
					)
				),
			props: { gameId, packageId, releaseId, buildId, primaryFileId, platform },
		});
	}
}
