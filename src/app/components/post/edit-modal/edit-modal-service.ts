import { defineAsyncComponent } from 'vue';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Modal } from '../../../../_common/modal/modal.service';

export type PostEditModalOptions = {
	community?: Community;
	channel?: CommunityChannel;
};

export class PostEditModal {
	static async show(
		postProvider: FiresidePost | Promise<FiresidePost>,
		options: PostEditModalOptions = {}
	) {
		options = options || {};
		return await Modal.show<FiresidePost>({
			modalId: 'PostEdit',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "PostEditModal" */ './edit-modal.vue')
			),
			noBackdropClose: true,
			noEscClose: true,
			size: 'sm',
			props: {
				postProvider: postProvider,
				community: options.community,
				channel: options.channel,
			},
		});
	}
}
