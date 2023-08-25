<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { User } from '../../../../_common/user/user.model';

const { user: loggedInUser } = useCommonStore();

const users = ref<User[]>([]);

onMounted(async () => {
	const response = await Api.sendFieldsRequest(
		'/mobile/inventory-collection',
		{
			users: '@' + loggedInUser.value!.username,
		},
		{ detach: true }
	);

	console.log(response);

	users.value = User.populate(response.users);
});
</script>

<template>
	<div id="shell-sidebar-atlas" class="fill-offset">
		ATLAS

		<div>
			<AppUserAvatarBubble
				v-for="user of users"
				:key="user.id"
				:user="user"
				:style="{ width: '100px', height: '100px' }"
			/>
		</div>
	</div>
</template>
