<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppBlockForm from '~common/block/form/AppBlockForm.vue';
import AppButton from '~common/button/AppButton.vue';
import { CommentModel } from '~common/comment/comment-model';
import { CommunityModel } from '~common/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { ForumPostModel } from '~common/forum/post/post.model';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import { GameModel } from '~common/game/game.model';
import { showInfoGrowl } from '~common/growls/growls.service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppReportForm from '~common/report/form/AppReportForm.vue';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

type Props = {
	resource:
		| CommentModel
		| UserModel
		| GameModel
		| FiresidePostModel
		| ForumTopicModel
		| ForumPostModel
		| CommunityModel;
};
const { resource } = defineProps<Props>();
const modal = useModal()!;

const page = ref<'report' | 'block'>('report');

const type = computed(() => {
	if (resource instanceof CommentModel) {
		return 'Comment';
	} else if (resource instanceof UserModel) {
		return 'User';
	} else if (resource instanceof GameModel) {
		return 'Game';
	} else if (resource instanceof FiresidePostModel) {
		return 'Fireside_Post';
	} else if (resource instanceof ForumTopicModel) {
		return 'Forum_Topic';
	} else if (resource instanceof ForumPostModel) {
		return 'Forum_Post';
	} else if (resource instanceof CommunityModel) {
		return 'Community';
	}
	return '';
});

function onSubmittedReport() {
	showInfoGrowl(
		$gettext(
			`Thanks for helping us make Game Jolt a place for everyone. We will take a look as soon as possible!`
		),
		$gettext('Reported')
	);

	if (type.value === 'User') {
		page.value = 'block';
	} else {
		modal.resolve();
	}
}

function onSubmittedBlock() {
	if (resource instanceof UserModel) {
		showInfoGrowl(
			$gettext(`You blocked %{ user }!`, {
				user: resource.username,
			}),
			$gettext('Blocked')
		);
	}

	modal.resolve();
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<AppBlockForm
				v-if="page === 'block'"
				:user="resource as UserModel"
				@submit="onSubmittedBlock"
			/>
			<AppReportForm v-else :type="type" :resource="resource" @submit="onSubmittedReport" />
		</div>
	</AppModal>
</template>
