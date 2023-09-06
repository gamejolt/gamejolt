import { defineAsyncComponent } from 'vue';
import { Router } from 'vue-router';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { showModal } from '../../../../../../_common/modal/modal.service';

export type CommunityCompetitionEntryModalHashDeregister = () => void;

async function _show(props: any) {
	return await showModal<void>({
		modalId: 'CommunityCompetitionEntry',
		component: defineAsyncComponent(() => import('./modal.vue')),
		props,
		size: 'sm',
	});
}

async function _showId(entryId: number) {
	return _show({ entryId });
}

export async function showEntryFromCommunityCompetitionEntryModal(
	entry: CommunityCompetitionEntryModel
) {
	return _show({ entry });
}

export async function showCommunityCompetitionEntryModalIdFromHash(router: Router) {
	const hash = router.currentRoute.value.hash;
	if (!hash || !hash.includes('#entry-')) {
		return;
	}

	const id = parseInt(hash.substring('#entry-'.length), 10);
	if (!id) {
		return;
	}

	return _showId(id);
}

export function watchCommunityCompetitionEntryModalForHash(router: Router) {
	const checkPath = router.currentRoute.value.path;
	return router.afterEach((to, _from) => {
		if (checkPath === to.path && !!to.hash) {
			showCommunityCompetitionEntryModalIdFromHash(router);
		}
	}) as CommunityCompetitionEntryModalHashDeregister;
}
