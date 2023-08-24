<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { Api } from '../api/api.service';
import AppButton from '../button/AppButton.vue';
import { CommentModel } from '../comment/comment-model';
import { formatNumber } from '../filters/number';
import { FiresidePostModel } from '../fireside/post/post-model';
import { GameModel } from '../game/game.model';
import AppLoading from '../loading/AppLoading.vue';
import AppModal from '../modal/AppModal.vue';
import { useModal } from '../modal/modal.service';
import AppTranslate from '../translate/AppTranslate.vue';
import AppUserList from '../user/list/AppUserList.vue';
import { UserModel } from '../user/user.model';
import { LikersResource } from './modal.service';

const UsersPerPage = 20;

const props = defineProps({
	count: {
		type: Number,
		required: true,
	},
	resource: {
		type: Object as PropType<LikersResource>,
		default: undefined,
	},
});

const { count, resource } = toRefs(props);
const modal = useModal()!;

const reachedEnd = ref(false);
const isLoading = ref(false);
const currentPage = ref(0);
const users = ref<UserModel[]>([]);

// Just for display purposes, if we have more users than the count passed in, display that instead.
// This can happen when the count was fetched before new users were added to the list.
const realCount = computed(() => {
	return Math.max(count.value, users.value.length);
});

const requestUrl = computed(() => {
	if (!resource?.value) {
		return;
	}

	if (resource.value instanceof CommentModel) {
		return '/comments/likers/' + resource.value.id;
	} else if (resource.value instanceof FiresidePostModel) {
		return '/web/posts/likers/' + resource.value.id;
	} else if (resource.value instanceof GameModel) {
		return '/web/discover/games/likers/' + resource.value.id;
	}
});

const shouldShowLoadMore = computed(() => {
	return !isLoading.value && !reachedEnd.value;
});

loadMore();

async function loadMore() {
	if (isLoading.value) {
		return;
	}

	isLoading.value = true;
	++currentPage.value;
	const payload = await Api.sendRequest(requestUrl.value + '?page=' + currentPage.value);

	const newUsers = UserModel.populate(payload.users);
	users.value = users.value.concat(newUsers);

	if (newUsers.length < UsersPerPage || users.value.length === count.value) {
		reachedEnd.value = true;
	}

	isLoading.value = false;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate
					:translate-n="realCount"
					:translate-params="{ count: formatNumber(realCount) }"
					translate-plural="%{ count } likes"
				>
					1 like
				</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<AppUserList :users="users" />

			<AppLoading v-if="isLoading" centered />

			<div v-if="shouldShowLoadMore" class="page-cut">
				<AppButton trans @click="loadMore()">
					{{ $gettext(`Load more`) }}
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>
