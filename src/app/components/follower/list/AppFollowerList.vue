<script lang="ts" setup>
import { PropType, ref, toRef, toRefs, watch } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserCard from '../../../../_common/user/card/AppUserCard.vue';
import AppUserCardPlaceholder from '../../../../_common/user/card/AppUserCardPlaceholder.vue';
import { UserModel } from '../../../../_common/user/user.model';

const props = defineProps({
	url: {
		type: String,
		required: true,
	},
	count: {
		type: Number,
		required: true,
	},
	initialUsers: {
		type: Array as PropType<UserModel[]>,
		required: true,
	},
});

const { url, count, initialUsers } = toRefs(props);

const users = ref<UserModel[]>([]);
const page = ref(1);
const isLoading = ref(false);
const reachedEnd = ref(false);

const placeholderCount = toRef(() => {
	// 2 rows, except for xs.
	if (Screen.isXs) {
		return 1;
	} else if (Screen.isSm) {
		return 4;
	} else if (Screen.isMd) {
		return 6;
	}
	return 8;
});

const shouldShowLoadMore = toRef(() => users.value.length < count.value && !reachedEnd.value);

watch(
	initialUsers,
	(newUsers: UserModel[]) => {
		// If the initial users changed, it means that the route was bootstrapped. Gotta clear
		// everything out again.

		users.value = [];
		page.value = 1;
		reachedEnd.value = false;

		if (newUsers) {
			users.value.push(...newUsers);
		}
	},
	{ immediate: true }
);

async function loadPage() {
	let currUrl = url.value;

	if (page.value) {
		currUrl += `?page=${page.value}`;
	}

	const payload = await Api.sendRequest(currUrl);
	return UserModel.populate(payload.users);
}

async function loadMore() {
	if (isLoading.value) {
		return;
	}

	page.value++;
	isLoading.value = true;

	const pageUsers = await loadPage();
	if (!pageUsers || !pageUsers.length) {
		page.value--;
		reachedEnd.value = true;
	} else {
		users.value.push(...pageUsers);
	}

	isLoading.value = false;
}
</script>

<template>
	<div class="follower-list">
		<div v-if="!users.length" class="-list">
			<div v-for="i of placeholderCount" :key="i">
				<AppUserCardPlaceholder />
			</div>
		</div>
		<template v-else>
			<div class="-list">
				<div v-for="_user of users" :key="_user.id">
					<AppUserCard :user="_user" elevate />
				</div>
			</div>

			<AppLoading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<AppButton trans @click="loadMore()">
					{{ $gettext(`Load More`) }}
				</AppButton>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-list
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
	grid-gap: 0px 16px
</style>
