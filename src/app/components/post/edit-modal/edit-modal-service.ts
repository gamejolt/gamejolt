import { defineAsyncComponent } from 'vue';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../_common/modal/modal.service';
import { Realm } from '../../../../_common/realm/realm-model';

export type PostEditModalOptions = {
	community?: Community;
	channel?: CommunityChannel;
	realm?: Realm;
};

export class PostEditModal {
	static async show(
		postProvider: FiresidePost | Promise<FiresidePost>,
		options: PostEditModalOptions = {}
	) {
		options = options || {};
		return await showModal<FiresidePost>({
			modalId: 'PostEdit',
			component: defineAsyncComponent(() => import('./edit-modal.vue')),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: {
				postProvider: postProvider,
				community: options.community,
				channel: options.channel,
				realm: options.realm,
			},
		});
	}
}
