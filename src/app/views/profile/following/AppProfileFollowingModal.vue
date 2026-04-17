<script lang="ts" setup>
import { onMounted, ref, toRef } from 'vue';

import AppFollowerList from '~app/components/follower/list/AppFollowerList.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import AppModal from '~common/modal/AppModal.vue';
import AppModalFloatingHeader from '~common/modal/AppModalFloatingHeader.vue';
import { useModal } from '~common/modal/modal.service';
import AppSectionTitle from '~common/section/AppSectionTitle.vue';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();

const modal = useModal()!;

const isBootstrapped = ref(false);
const users = ref<UserModel[]>([]);

const loadUrl = toRef(() => `/web/profile/following/@${user.username}`);

onMounted(async () => {
	try {
		const payload = await Api.sendRequest(loadUrl.value, undefined, { detach: true });
		users.value = UserModel.populate(payload.users);
	} catch (e) {
		console.error(
			'Something went wrong fetching the users this user is following',
			user.username,
			e
		);
	} finally {
		isBootstrapped.value = true;
	}
});
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader :controls-gap="16">
			<template #inline-title>
				<AppSectionTitle class="mr-auto flex-auto" :avatar-height="48" :slot-data="user">
					<template #title>
						{{ $gettext(`Following`) }}
					</template>
				</AppSectionTitle>
			</template>

			<template #modal-controls>
				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</template>
		</AppModalFloatingHeader>

		<div class="modal-body">
			<AppLoading v-if="!isBootstrapped" hide-label stationary centered />
			<div v-else-if="!user.following_count" class="alert alert-info">
				{{ $gettext(`This user isn't following anyone yet.`) }}
			</div>
			<AppFollowerList
				v-else
				:url="loadUrl"
				:initial-users="users"
				:count="user.following_count || 0"
			/>
		</div>
	</AppModal>
</template>
