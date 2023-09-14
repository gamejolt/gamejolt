import { defineAsyncComponent } from 'vue';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import { showModal } from '../../../../_common/modal/modal.service';
import { RealmModel } from '../../../../_common/realm/realm-model';

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
