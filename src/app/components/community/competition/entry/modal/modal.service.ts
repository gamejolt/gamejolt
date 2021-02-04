import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../utils/utils';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { Modal } from '../../../../../../_common/modal/modal.service';

export type CommunityCompetitionEntryModalHashDeregister = () => void;

export class CommunityCompetitionEntryModal {
	static async showEntry(router: VueRouter, entry: CommunityCompetitionEntry) {
		return this.show(router, entry.id, { entry });
	}

	static async showId(router: VueRouter, entryId: number) {
		return this.show(router, entryId, { entryId });
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

		return this.showId(router, id);
	}

	private static async show(router: VueRouter, entryId: number, props: any) {
		return await Modal.show<void>({
			modalId: 'CommunityCompetitionEntry',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityCompetitionEntryModal" */ './modal.vue')
				),
			props,
			size: 'lg',
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
