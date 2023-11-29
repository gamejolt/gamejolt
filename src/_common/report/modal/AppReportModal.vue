<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import AppBlockForm from '../../block/form/form.vue';
import AppButton from '../../button/AppButton.vue';
import { CommentModel } from '../../comment/comment-model';
import { CommunityModel } from '../../community/community.model';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { ForumPostModel } from '../../forum/post/post.model';
import { ForumTopicModel } from '../../forum/topic/topic.model';
import { GameModel } from '../../game/game.model';
import { showInfoGrowl } from '../../growls/growls.service';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { $gettext } from '../../translate/translate.service';
import { UserModel } from '../../user/user.model';
import AppReportForm from '../form/form.vue';

const props = defineProps({
	resource: {
		type: Object as PropType<
			| CommentModel
			| UserModel
			| GameModel
			| FiresidePostModel
			| ForumTopicModel
			| ForumPostModel
			| CommunityModel
		>,
		required: true,
	},
});

const { resource } = toRefs(props);
const modal = useModal()!;

const page = ref<'report' | 'block'>('report');

const type = computed(() => {
	if (resource.value instanceof CommentModel) {
		return 'Comment';
	} else if (resource.value instanceof UserModel) {
		return 'User';
	} else if (resource.value instanceof GameModel) {
		return 'Game';
	} else if (resource.value instanceof FiresidePostModel) {
		return 'Fireside_Post';
	} else if (resource.value instanceof ForumTopicModel) {
		return 'Forum_Topic';
	} else if (resource.value instanceof ForumPostModel) {
		return 'Forum_Post';
	} else if (resource.value instanceof CommunityModel) {
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
	if (resource.value instanceof UserModel) {
		showInfoGrowl(
			$gettext(`You blocked %{ user }!`, {
				user: resource.value.username,
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
				:user="(resource as UserModel)"
				@submit="onSubmittedBlock"
			/>
			<AppReportForm v-else :type="type" :resource="resource" @submit="onSubmittedReport" />
		</div>
	</AppModal>
</template>
