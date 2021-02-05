import { asyncComponentLoader } from '../../../../../../utils/utils';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { Modal } from '../../../../../../_common/modal/modal.service';

interface Options {
	community: Community;
	channel: CommunityChannel;
}

export class CommunityCompetitionSidebarModal {
	static async show(options: Options) {
		const { community, channel } = options;

		return await Modal.show<void>({
			modalId: 'CommunityCompetitionSidebarModal-' + channel.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityCompetitionSidebarModal" */ './modal.vue')
				),
			props: {
				community,
				channel,
			},
			size: 'sm',
		});
	}
}
