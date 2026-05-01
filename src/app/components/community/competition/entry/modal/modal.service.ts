import { defineAsyncComponent } from 'vue';

import { CommunityCompetitionEntryModel } from '~common/community/competition/entry/entry.model';
import { showModal } from '~common/modal/modal.service';
import { getCurrentRouter } from '~common/route/current-router-service';

export type CommunityCompetitionEntryModalHashDeregister = () => void;

async function _show(props: any) {
	return await showModal<void>({
		modalId: 'CommunityCompetitionEntry',
		component: defineAsyncComponent(
			() =>
				import('~app/components/community/competition/entry/modal/AppCommunityCompetitionEntryModal.vue')
		),
		props,
		size: 'sm',
	});
}

export async function showEntryFromCommunityCompetitionEntryModal(
	entry: CommunityCompetitionEntryModel
) {
	return _show({ entry });
}

export async function showCommunityCompetitionEntryModalIdFromHash() {
	const hash = getCurrentRouter().currentRoute.value.hash;
	if (!hash || !hash.includes('#entry-')) {
		return;
	}

	const id = parseInt(hash.substring('#entry-'.length), 10);
	if (!id) {
		return;
	}

	return _show({ entryId: id });
}

export function watchCommunityCompetitionEntryModalForHash() {
	const router = getCurrentRouter();
	const checkPath = router.currentRoute.value.path;
	return router.afterEach((to, _from) => {
		if (checkPath === to.path && !!to.hash) {
			showCommunityCompetitionEntryModalIdFromHash();
		}
	}) as CommunityCompetitionEntryModalHashDeregister;
}
