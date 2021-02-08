import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../utils/utils';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { Modal } from '../../../../../../_common/modal/modal.service';

export type CommunityCompetitionEntryModalHashDeregister = () => void;

export class CommunityCompetitionEntryModal {
	static async showEntry(entry: CommunityCompetitionEntry) {
		return this.show({ entry });
	}

	private static async showId(entryId: number) {
		return this.show({ entryId });
	}

	static async showFromHash(router: VueRouter) {
		const hash = router.currentRoute.hash;
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
		return await Modal.show<void>({
			modalId: 'CommunityCompetitionEntry',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityCompetitionEntryModal" */ './modal.vue')
				),
			props,
			size: 'sm',
		});
	}

	static watchForHash(router: VueRouter) {
		const checkPath = router.currentRoute.path;
		return router.afterEach((to, _from) => {
			if (checkPath === to.path && !!to.hash) {
				this.showFromHash(router);
			}
		}) as CommunityCompetitionEntryModalHashDeregister;
	}
}
