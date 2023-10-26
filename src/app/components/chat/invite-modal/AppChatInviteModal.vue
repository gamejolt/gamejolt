<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/AppUserAvatarList.vue';
import { fuzzysearch } from '../../../../utils/string';
import { run } from '../../../../utils/utils';
import { useGridStore } from '../../grid/grid-store';
import { addGroupMembers, addGroupRoom } from '../client';
import { ChatRoomModel } from '../room';
import { ChatUser } from '../user';

const props = defineProps({
	room: {
		type: Object as PropType<ChatRoomModel>,
		required: true,
	},
	friends: {
		type: Array as PropType<ChatUser[]>,
		required: true,
	},
	initialUser: {
		type: Object as PropType<ChatUser>,
		default: null,
	},
});

const { room, friends, initialUser } = toRefs(props);
const { chatUnsafe: chat } = useGridStore();
const modal = useModal()!;

const isLoading = ref(true);
const filterQuery = ref('');
const selectedUsers = ref(initialUser.value ? [initialUser.value] : []);
const invitableFriends = ref(friends.value);

run(async function () {
	let filteredFriends = invitableFriends.value;

	// We want to put the initial user at the top of the list.
	if (initialUser.value) {
		const initialUserId = initialUser.value.id;
		filteredFriends = filteredFriends.filter(i => i.id !== initialUserId);
		filteredFriends.unshift(initialUser.value);
	}

	// Get which of the friends can be invited to this particular room.
	const payload = await Api.sendRequest(`/web/chat/rooms/invitable-users/${room.value.id}`);

	if (payload.user_ids) {
		// Filter the set of friends to only those that were allowed from backend.
		filteredFriends = filteredFriends.filter(i => payload.user_ids.includes(i.id));
	} else {
		// None allowed...
		filteredFriends = [];
	}

	invitableFriends.value = filteredFriends;
	isLoading.value = false;
});

const filteredUsers = computed(() => {
	if (!filterQuery.value) {
		return invitableFriends.value;
	}

	const filter = filterQuery.value.toLowerCase();
	return invitableFriends.value.filter(
		i =>
			fuzzysearch(filter, i.display_name.toLowerCase()) ||
			fuzzysearch(filter, i.username.toLowerCase())
	);
});

function invite() {
	const selectedUserIds = selectedUsers.value.map(chatUser => chatUser.id);

	if (room.value.isPmRoom) {
		addGroupRoom(chat.value, selectedUserIds);
	} else {
		addGroupMembers(chat.value, room.value.id, selectedUserIds);
	}
	modal.resolve(true);
}

function toggle(user: ChatUser) {
	const index = selectedUsers.value.findIndex(chatUser => chatUser.id === user.id);
	if (index !== -1) {
		selectedUsers.value.splice(index, 1);
	} else {
		selectedUsers.value.push(user);
	}
}

function selected(user: ChatUser) {
	return selectedUsers.value.some(chatUser => chatUser.id === user.id);
}
</script>

<template>
	<AppModal>
		<template #default>
			<div class="modal-controls">
				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</div>

			<div class="modal-header">
				<h2 class="modal-title">
					{{ $gettext(`Choose friends`) }}
				</h2>
			</div>

			<div class="modal-body">
				<AppLoading v-if="isLoading" centered />
				<div v-else class="friend-select-widget">
					<input
						v-model="filterQuery"
						class="-filter form-control"
						placeholder="Filter..."
					/>

					<AppScrollScroller>
						<div class="-user-list">
							<div
								v-for="user of filteredUsers"
								:key="user.id"
								class="-user-list-item"
								@click="toggle(user)"
							>
								<div class="-avatar">
									<AppUserAvatarImg :user="user" />
								</div>

								<div class="-label">
									<div class="-name">
										{{ user.display_name }}
									</div>
									<div class="-username">@{{ user.username }}</div>
								</div>
								<div class="-radio" :class="{ '-active': selected(user) }">
									<AppJolticon
										:icon="selected(user) ? 'checkbox' : 'box-empty'"
									/>
								</div>
							</div>
						</div>
					</AppScrollScroller>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="-bottom">
				<AppUserAvatarList
					v-if="selectedUsers.length > 0"
					class="-selected-users"
					:users="selectedUsers"
					sm
				/>

				<AppButton primary block :disabled="selectedUsers.length < 1" @click="invite">
					<template v-if="room.isPmRoom">
						{{ $gettext(`Create group`) }}
					</template>
					<template v-else>
						{{ $gettext(`Add to group`) }}
					</template>
				</AppButton>
			</div>
		</template>
	</AppModal>
</template>

<style lang="stylus" scoped>
$-v-padding = 15px
$-h-padding = 20px
$-height = 40px

.-filter
	margin-bottom: 8px

.-user-list-item
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid
	cursor: pointer

	&:last-child
		border-bottom: 0

	&:hover
		.-radio
			color: var(--theme-link-hover)

.-radio
	color: var(--theme-bg-subtle)

	&.-active
		color: var(--theme-highlight)

.-avatar
	flex: none
	width: $-height
	margin-right: $-h-padding

.-label
	flex: auto
	overflow: hidden

.-name
.-username
	text-overflow()

.-name
	font-weight: bold

.-username
	theme-prop('color', 'fg-muted')
	font-size: $font-size-small

.-button
	flex: none
	margin-left: $-h-padding

.-selected-users
	display: flex
	justify-content: center
	margin-top: -10px
	margin-bottom: 4px

.-bottom
	padding-bottom: $line-height-computed
</style>
