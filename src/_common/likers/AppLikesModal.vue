<script lang="ts" setup>
import { computed, ref } from 'vue';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { CommentModel } from '~common/comment/comment-model';
import { formatNumber } from '~common/filters/number';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { LikersResource } from '~common/likers/modal.service';
import AppLoading from '~common/loading/AppLoading.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppUserList from '~common/user/list/AppUserList.vue';
import { UserModel } from '~common/user/user.model';

const UsersPerPage = 20;

type Props = {
	count: number;
	resource?: LikersResource;
};
const { count, resource } = defineProps<Props>();
const modal = useModal()!;

const reachedEnd = ref(false);
const isLoading = ref(false);
const currentPage = ref(0);
const users = ref<UserModel[]>([]);

// Just for display purposes, if we have more users than the count passed in, display that instead.
// This can happen when the count was fetched before new users were added to the list.
const realCount = computed(() => {
	return Math.max(count, users.value.length);
});

const requestUrl = computed(() => {
	if (!resource) {
		return;
	}

	if (resource instanceof CommentModel) {
		return '/comments/likers/' + resource.id;
	} else if (resource instanceof FiresidePostModel) {
		return '/web/posts/likers/' + resource.id;
	} else if (resource instanceof GameModel) {
		return '/web/discover/games/likers/' + resource.id;
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

	if (newUsers.length < UsersPerPage || users.value.length === count) {
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
