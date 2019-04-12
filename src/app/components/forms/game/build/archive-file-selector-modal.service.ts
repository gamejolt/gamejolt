import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
					import(/* webpackChunkName: "ArchiveFileSelectorModal" */ './archive-file-selector-modal.vue')
				),
			props: { gameId, packageId, releaseId, buildId, primaryFileId, platform },
		});
	}
}
