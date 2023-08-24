<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppBlockForm from '../../block/form/form.vue';
import { CommentModel } from '../../comment/comment-model';
import { CommunityModel } from '../../community/community.model';
import { FiresideModel } from '../../fireside/fireside.model';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { ForumPostModel } from '../../forum/post/post.model';
import { ForumTopicModel } from '../../forum/topic/topic.model';
import { GameModel } from '../../game/game.model';
import { showInfoGrowl } from '../../growls/growls.service';
import { BaseModal } from '../../modal/base';
import { UserModel } from '../../user/user.model';
import AppReportForm from '../form/form.vue';

@Options({
	components: {
		AppReportForm,
		AppBlockForm,
	},
})
export default class AppReportModal extends mixins(BaseModal) {
	@Prop(Object)
	resource!:
		| CommentModel
		| UserModel
		| GameModel
		| FiresidePostModel
		| ForumTopicModel
		| ForumPostModel
		| CommunityModel
		| FiresideModel;

	page: 'report' | 'block' = 'report';

	get type() {
		if (this.resource instanceof CommentModel) {
			return 'Comment';
		} else if (this.resource instanceof UserModel) {
			return 'User';
		} else if (this.resource instanceof GameModel) {
			return 'Game';
		} else if (this.resource instanceof FiresidePostModel) {
			return 'Fireside_Post';
		} else if (this.resource instanceof ForumTopicModel) {
			return 'Forum_Topic';
		} else if (this.resource instanceof ForumPostModel) {
			return 'Forum_Post';
		} else if (this.resource instanceof CommunityModel) {
			return 'Community';
		} else if (this.resource instanceof FiresideModel) {
			return 'Fireside';
		}
		return '';
	}

	get title() {
		if (this.page === 'block') {
			return this.$gettext('Block User');
		}

		switch (this.type) {
			case 'Comment':
				return this.$gettext('Report Comment');
			case 'Game':
				return this.$gettext('Report Game');
			case 'Fireside_Post':
				return this.$gettext('Report Post');
			case 'User':
				return this.$gettext('Report User');
			case 'Forum_Topic':
				return this.$gettext('Report Topic');
			case 'Forum_Post':
				return this.$gettext('Report Post');
			case 'Community':
				return this.$gettext(`Report Community`);
			case 'Fireside':
				return this.$gettext(`Report Fireside`);
		}

		return '';
	}

	onSubmittedReport() {
		showInfoGrowl(
			this.$gettext(
				`Thanks for helping us make Game Jolt a place for everyone. We will take a look as soon as possible!`
			),
			this.$gettext('Reported')
		);

		if (this.type === 'User') {
			this.page = 'block';
		} else {
			this.modal.resolve();
		}
	}

	onSubmittedBlock() {
		if (this.resource instanceof UserModel) {
			showInfoGrowl(
				this.$gettextInterpolate(`You blocked %{ user }!`, {
					user: this.resource.username,
				}),
				this.$gettext('Blocked')
			);
		}

		this.modal.resolve();
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<AppBlockForm v-if="page === 'block'" :user="resource" @submit="onSubmittedBlock" />
			<AppReportForm v-else :type="type" :resource="resource" @submit="onSubmittedReport" />
		</div>
	</AppModal>
</template>
