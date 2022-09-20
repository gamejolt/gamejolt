<script lang="ts" setup>
import { computed, onMounted, PropType, ref, toRefs } from 'vue';
import AppUserList from '../../app/components/user/list/AppUserList.vue';
import { Api } from '../api/api.service';
import AppButton from '../button/AppButton.vue';
import { formatNumber } from '../filters/number';
import { FiresidePost } from '../fireside/post/post-model';
import { Game } from '../game/game.model';
import AppLoading from '../loading/AppLoading.vue';
import AppModal from '../modal/AppModal.vue';
import { useModal } from '../modal/modal.service';
import AppTranslate from '../translate/AppTranslate.vue';
import { User } from '../user/user.model';
import { SupportersModel } from './modal.service';

const PerPage = 20;

const props = defineProps({
	model: {
		type: Object as PropType<SupportersModel>,
		required: true,
	},
	count: {
		type: Number,
		default: undefined,
	},
});

const { count, model } = toRefs(props);
const modal = useModal()!;

const reachedEnd = ref(false);
const isLoading = ref(false);
const currentPage = ref(0);
const users = ref<User[]>([]);

const isGame = computed(() => model.value instanceof Game);

// Just for display purposes, if we have more users than the count passed in,
// display that instead. This can happen when the count was fetched before new
// users were added to the list.
const realCount = computed(() => (count?.value ? Math.max(count.value, users.value.length) : 0));
const shouldShowLoadMore = computed(() => !isLoading.value && !reachedEnd.value);

const requestUrl = computed(() => {
	if (model.value instanceof FiresidePost) {
		return `/web/posts/supporters/${model.value.id}?perPage=${PerPage}&offset=${users.value.length}`;
	} else if (model.value instanceof Game) {
		return `/web/discover/games/supporters/${model.value.id}?page=${currentPage.value}`;
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

	const newUsers = User.populate(payload.supporters);
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
