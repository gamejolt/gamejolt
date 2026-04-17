<script lang="ts" setup>
import { toRef } from 'vue';
import { useRouter } from 'vue-router';

import { useProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import { showBlockModal } from '~common/block/modal/modal.service';
import AppButton from '~common/button/AppButton.vue';
import { Environment } from '~common/environment/environment.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import { showReportModal } from '~common/report/modal/modal.service';
import { copyShareLink } from '~common/share/share.service';
import { useCommonStore } from '~common/store/common-store';
import { UserFriendshipState } from '~common/user/friendship/friendship.model';

const router = useRouter();

const { user: myUser } = useCommonStore();
const { user: routeUser, isMe, userFriendship, removeFriend } = useProfileRouteStore()!;

const canBlock = toRef(() => routeUser.value && !routeUser.value.is_blocked && !isMe.value);

function copyShareUrl() {
	if (!routeUser.value) {
		return;
	}
	const url = Environment.baseUrl + routeUser.value.url;
	copyShareLink(url, 'user');
}

function report() {
	if (routeUser.value) {
		showReportModal(routeUser.value);
	}
}

async function blockUser() {
	if (routeUser.value) {
		const result = await showBlockModal(routeUser.value);

		// Navigate away from the page after blocking.
		if (result) {
			router.push({
				name: 'dash.account.blocks',
			});
		}
	}
}
</script>

<template>
	<AppPopper v-if="routeUser" popover-class="fill-darkest" :style="{ flex: `none` }">
		<template #default>
			<slot name="default">
				<AppButton icon="ellipsis-v" sparse />
			</slot>
		</template>

		<template #popover>
			<div class="list-group list-group-dark">
				<a class="list-group-item has-icon" @click="copyShareUrl">
					<AppJolticon icon="link" />
					{{ $gettext(`Copy link to user`) }}
				</a>
				<a
					v-if="myUser && routeUser.id !== myUser.id"
					class="list-group-item has-icon"
					@click="report"
				>
					<AppJolticon icon="flag" />
					{{ $gettext(`Report user`) }}
				</a>
				<a
					v-if="userFriendship && userFriendship.state === UserFriendshipState.Friends"
					class="list-group-item has-icon"
					@click="removeFriend()"
				>
					<AppJolticon icon="friend-remove-1" notice />
					{{ $gettext(`Remove friend`) }}
				</a>
				<a v-if="canBlock" class="list-group-item has-icon" @click="blockUser">
					<AppJolticon icon="friend-remove-2" notice />
					{{ $gettext(`Block user`) }}
				</a>
				<a
					v-if="myUser && myUser.permission_level > 0"
					class="list-group-item has-icon"
					:href="`${Environment.baseUrl}/moderate/users/view/${routeUser.id}`"
					target="_blank"
				>
					<AppJolticon icon="cog" />
					{{ $gettext(`Moderate user`) }}
				</a>
			</div>
		</template>
	</AppPopper>
</template>
