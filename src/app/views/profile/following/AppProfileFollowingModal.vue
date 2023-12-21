<script lang="ts" setup>
import { PropType, onMounted, ref, toRef, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppSectionTitle from '../../../../_common/section/AppSectionTitle.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import AppFollowerList from '../../../components/follower/list/AppFollowerList.vue';

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const { user } = toRefs(props);

const modal = useModal()!;

const isBootstrapped = ref(false);
const users = ref<UserModel[]>([]);

const loadUrl = toRef(() => `/web/profile/following/@${user.value.username}`);

onMounted(async () => {
	try {
		const payload = await Api.sendRequest(loadUrl.value, undefined, { detach: true });
		users.value = UserModel.populate(payload.users);
	} catch (e) {
		console.error(
			'Something went wrong fetching the users this user is following',
			user.value.username,
			e
		);
	} finally {
		isBootstrapped.value = true;
	}
});
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader>
			<template #inline-title>
				<AppSectionTitle
					:style="{ marginRight: `auto`, flex: `auto` }"
					:avatar-height="48"
					:slot-data="user"
				>
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
