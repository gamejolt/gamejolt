<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { formatNumber } from '~common/filters/number';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import AppLoading from '~common/loading/AppLoading.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { SupportersModel } from '~common/supporters/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppUserList from '~common/user/list/AppUserList.vue';
import { UserModel } from '~common/user/user.model';

const PerPage = 20;

type Props = {
	model: SupportersModel;
	count?: number;
};
const { count, model } = defineProps<Props>();
const modal = useModal()!;

const reachedEnd = ref(false);
const isLoading = ref(false);
const currentPage = ref(0);
const users = ref<UserModel[]>([]);

const isGame = computed(() => model instanceof GameModel);

// Just for display purposes, if we have more users than the count passed in,
// display that instead. This can happen when the count was fetched before new
// users were added to the list.
const realCount = computed(() => (count ? Math.max(count, users.value.length) : 0));
const shouldShowLoadMore = computed(() => !isLoading.value && !reachedEnd.value);

const requestUrl = computed(() => {
	if (model instanceof FiresidePostModel) {
		return `/web/posts/supporters/${model.id}?perPage=${PerPage}&offset=${users.value.length}`;
	} else if (model instanceof GameModel) {
		return `/web/discover/games/supporters/${model.id}?page=${currentPage.value}`;
	}

	throw new Error(`Invalid model type.`);
});

onMounted(() => {
	loadMore();
});

async function loadMore() {
	if (isLoading.value) {
		return;
	}

	isLoading.value = true;
	++currentPage.value;
	const payload = await Api.sendRequest(requestUrl.value);

	const newUsers = UserModel.populate(payload.supporters);
	users.value = [...users.value, ...newUsers];

	if (newUsers.length < PerPage) {
		reachedEnd.value = true;
	}

	isLoading.value = false;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<template v-if="count">
					<AppTranslate
						:translate-n="realCount"
						:translate-params="{ count: formatNumber(realCount) }"
						translate-plural="%{ count } supporters"
					>
						1 supporter
					</AppTranslate>
				</template>
				<template v-else>
					<AppTranslate>Supporters</AppTranslate>
				</template>
			</h2>

			<p v-if="isGame">
				<AppTranslate>
					The kind people that supported by paying more than the minimum.
				</AppTranslate>
			</p>
		</div>

		<div class="modal-body">
			<AppUserList :users="users" />

			<AppLoading v-if="isLoading" centered />

			<div v-if="shouldShowLoadMore" class="page-cut">
				<AppButton trans @click="loadMore()">
					<AppTranslate>Load More</AppTranslate>
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>
