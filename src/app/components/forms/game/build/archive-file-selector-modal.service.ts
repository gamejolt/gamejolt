import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';

export class ArchiveFileSelectorModal {
	static async show(
		gameId: number,
		packageId: number,
		releaseId: number,
		buildId: number,
		primaryFileId: number,
		platform: string
	) {
		return await showModal<string>({
			modalId: 'ArchiveFileSelector',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "ArchiveFileSelectorModal" */ './archive-file-selector-modal.vue'
					)
			),
			props: { gameId, packageId, releaseId, buildId, primaryFileId, platform },
		});
	}
}
