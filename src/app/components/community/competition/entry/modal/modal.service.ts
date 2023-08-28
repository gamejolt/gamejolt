import { defineAsyncComponent } from 'vue';
import { Router } from 'vue-router';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { showModal } from '../../../../../../_common/modal/modal.service';

export type CommunityCompetitionEntryModalHashDeregister = () => void;

export class CommunityCompetitionEntryModal {
	static async showEntry(entry: CommunityCompetitionEntryModel) {
		return this.show({ entry });
	}

	private static async showId(entryId: number) {
		return this.show({ entryId });
	}

	static async showFromHash(router: Router) {
		const hash = router.currentRoute.value.hash;
		if (!hash || !hash.includes('#entry-')) {
			return;
		}

		const id = parseInt(hash.substring('#entry-'.length), 10);
		if (!id) {
			return;
		}

		return this.showId(id);
	}

	private static async show(props: any) {
		return await showModal<void>({
			modalId: 'CommunityCompetitionEntry',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props,
			size: 'sm',
		});
	}

	static watchForHash(router: Router) {
		const checkPath = router.currentRoute.value.path;
		return router.afterEach((to, _from) => {
			if (checkPath === to.path && !!to.hash) {
				this.showFromHash(router);
			}
		}) as CommunityCompetitionEntryModalHashDeregister;
	}
}
