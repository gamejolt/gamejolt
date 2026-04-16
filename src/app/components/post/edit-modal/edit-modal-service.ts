import { defineAsyncComponent } from 'vue';

import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { showModal } from '~common/modal/modal.service';
import { RealmModel } from '~common/realm/realm-model';

export type PostEditModalOptions = {
	community?: CommunityModel;
	channel?: CommunityChannelModel;
	realm?: RealmModel;
};

export async function showPostEditModal(
	postProvider: FiresidePostModel | Promise<FiresidePostModel>,
	options: PostEditModalOptions = {}
) {
	options = options || {};
	return await showModal<FiresidePostModel>({
		modalId: 'PostEdit',
		component: defineAsyncComponent(() => import('~app/components/post/edit-modal/AppPostEditModal.vue')),
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
