import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showArchiveFileSelectorModal(
	gameId: number,
	packageId: number,
	releaseId: number,
	buildId: number,
	primaryFileId: number,
	platform: string
) {
	return await showModal<string>({
		modalId: 'ArchiveFileSelector',
		component: defineAsyncComponent(() => import('./AppArchiveFileSelectorModal.vue')),
		props: { gameId, packageId, releaseId, buildId, primaryFileId, platform },
	});
}
