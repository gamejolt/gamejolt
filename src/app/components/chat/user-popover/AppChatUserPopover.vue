<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { kThemeDarkest } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserVerifiedTick from '../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { styleWhen } from '../../../../_styles/mixins';
import {
	kBorderWidthLg,
	kFontFamilyTiny,
	kFontSizeSmall,
	kFontSizeTiny,
} from '../../../../_styles/variables';
import { useGridStore } from '../../grid/grid-store';
import {
	isUserOnline,
	kickGroupMember,
	openChatRoom,
	RoboJoltUserId,
	tryGetRoomRole,
	userCanModerateOtherUser,
} from '../client';
import { ChatRoomModel } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';

const props = defineProps({
	user: {
		type: Object as PropType<ChatUser>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoomModel>,
		required: true,
	},
});

const { user, room } = toRefs(props);
const { chatUnsafe: chat } = useGridStore();

const isOnline = computed(() => {
	if (!chat.value) {
		return null;
	}

	return isUserOnline(chat.value, user.value.id);
});

const isOwner = computed(() => room.value.owner_id === user.value.id);
const isRobojolt = computed(() => user.value.id === RoboJoltUserId);

const isModerator = computed(() => {
	const role = tryGetRoomRole(room.value, user.value);
	return role === 'moderator';
});

const canMessage = computed(() => {
	// Don't show "Send message" link when already in PM room with the user.
	if (room.value.isPmRoom) {
		return false;
	}

	// Show when users are friends.
	return chat.value.friendsList.get(user.value) !== undefined;
});

const canModerate = computed(() => {
	if (!chat.value || !chat.value.currentUser || isRobojolt.value) {
		return false;
	}

	return userCanModerateOtherUser(room.value, chat.value.currentUser, user.value);
});

const canChangeModerator = computed(() => {
	if (!chat.value.currentUser || isRobojolt.value) {
		return false;
	}
	if (!room.value.canElectModerators) {
		return false;
	}

	// In public rooms, staff members cannot lose their mod status.
	if (!room.value.isPrivateRoom && user.value.isStaff) {
		return false;
	}

	// Only the owner of the room can promote/demote moderators.
	return chat.value.currentUser.id === room.value.owner_id;
});

const canKick = computed(() => {
	// Cannot kick one of your mods, gotta demote first.
	if (isModerator.value || isRobojolt.value) {
		return false;
	}

	// In public rooms, staff members can never get kicked.
	if (!room.value.isPrivateRoom && user.value.isStaff) {
		return false;
	}

	return true;
});

function onClickSendMessage() {
	const friend = chat.value.friendsList.get(user.value);
	if (friend) {
		openChatRoom(chat.value, friend.room_id);
	}
}

async function onClickKick() {
	const message = canMessage.value
		? $gettext(`Are you sure you want to kick %{ user } from the room?`, {
				user: user.value.display_name,
		  })
		: $gettext(
				`Are you sure you want to kick @%{ username } from this room? You're not friends with this user, so you won't be able to invite them back into this room.`,
				{ username: user.value.username }
		  );
	const confirm = await showModalConfirm(
		message,
		$gettext(`Kick @%{ username }`, { username: user.value.username })
	);

	if (confirm) {
		kickGroupMember(chat.value, room.value, user.value.id);
	}
}

async function onClickPromoteModerator() {
	const result = await showModalConfirm(
		$gettext(
			`Do you want to promote @%{ username } to moderator? They will be able to remove messages and kick users from the chat. You can demote them at any time.`,
			{ username: user.value.username }
		)
	);

	if (result) {
		const payload = await Api.sendRequest(
			`/web/dash/fireside/chat/promote-moderator/${room.value.id}/${user.value.id}`,
			{}
		);

		if (payload.success && payload.role) {
			showSuccessGrowl(
				$gettext(`@%{ username } has been promoted to moderator.`, {
					username: user.value.username,
				})
			);
		}
	}
}

async function onClickDemoteModerator() {
	const result = await showModalConfirm(
		$gettext(`Do you want to demote @%{ username } to a normal user?`, {
			username: user.value.username,
		})
	);

	if (result) {
		const payload = await Api.sendRequest(
			`/web/dash/fireside/chat/demote-moderator/${room.value.id}/${user.value.id}`,
			{}
		);
		if (payload.success && payload.role) {
			showSuccessGrowl(
				$gettext(`@%{ username } is no longer a moderator.`, {
					username: user.value.username,
				})
			);
		}
	}
}

const statusStyles: CSSProperties = {
	marginTop: `8px`,
	display: `flex`,
	fontFamily: kFontFamilyTiny,
	fontSize: kFontSizeTiny.px,
	fontWeight: `bold`,
	justifyContent: `center`,
	alignItems: `center`,
	userSelect: `none`,
	lineHeight: 1,
};

const styleStatusIcon: CSSProperties = {
	verticalAlign: `middle`,
};
</script>

<template>
	<div>
		<div
			class="fill-darker"
			:style="{
				padding: `16px`,
				borderBottom: `${kBorderWidthLg.px} solid ${kThemeDarkest}`,
				width: `250px`,
			}"
		>
			<div
				:style="{
					display: `flex`,
					justifyContent: `center`,
					marginBottom: `10px`,
				}"
			>
				<div
					class="elevate-hover-2"
					:style="{
						position: `relative`,
						borderRadius: `50%`,
					}"
				>
					<AppOnHover v-slot="{ hoverBinding, hovered }">
						<AppUserAvatar
							v-bind="{
								...hoverBinding,
								style: [
									{
										width: `72px`,
										height: `72px`,
										zIndex: 2,
										transition: `filter 0.1s ease`,
									},
									styleWhen(hovered, {
										filter: `brightness(0.6) contrast(1.1)`,
									}),
								],
							}"
							:user="user"
						/>
					</AppOnHover>
					<div
						:style="{
							position: `absolute`,
							top: `-4px`,
							left: `-4px`,
							width: `80px`,
							height: `80px`,
							borderRadius: `50%`,
							zIndex: 1,
							backgroundColor: kThemeDarkest,
						}"
					/>
				</div>
			</div>

			<div
				:style="{
					marginTop: `4px`,
					textAlign: `center`,
				}"
			>
				<div>
					<b>{{ user.display_name }}</b>
					<AppUserVerifiedTick :user="user" vertical-align />
				</div>
				<div
					class="text-muted"
					:style="{
						fontSize: kFontSizeSmall.px,
					}"
				>
					@{{ user.username }}
				</div>
			</div>

			<div v-if="isOnline !== null" :style="statusStyles">
				<AppChatUserOnlineStatus
					:style="{
						marginRight: `4px`,
						alignSelf: `stretch`,
					}"
					:is-online="isOnline"
					:size="12"
					:segment-width="1.5"
				/>
				<span>{{ isOnline ? $gettext(`Online`) : $gettext(`Offline`) }}</span>
			</div>

			<div v-if="isOwner" :style="statusStyles">
				<AppJolticon :style="styleStatusIcon" icon="crown" />
				&nbsp;
				{{ $gettext(`Room owner`) }}
			</div>
			<div v-else-if="isModerator" :style="statusStyles">
				<AppJolticon :style="styleStatusIcon" icon="star" />
				&nbsp;
				{{ $gettext(`Moderator`) }}
			</div>
		</div>

		<div class="list-group list-group-dark">
			<RouterLink
				:to="{ name: 'profile.overview', params: { username: user.username } }"
				class="list-group-item has-icon"
			>
				<AppJolticon icon="user" />
				{{ $gettext(`View profile`) }}
			</RouterLink>
			<a v-if="canMessage" class="list-group-item has-icon" @click="onClickSendMessage">
				<AppJolticon icon="message" />
				{{ $gettext(`Send message`) }}
			</a>
			<template v-if="canModerate">
				<template v-if="canChangeModerator">
					<hr />
					<template v-if="!isModerator">
						<a class="list-group-item has-icon" @click="onClickPromoteModerator">
							<AppJolticon icon="star" />
							{{ $gettext(`Promote to moderator`) }}
						</a>
					</template>
					<template v-else>
						<a class="list-group-item has-icon" @click="onClickDemoteModerator">
							<AppJolticon icon="remove" notice />
							{{ $gettext(`Demote moderator`) }}
						</a>
					</template>
				</template>

				<template v-if="canKick">
					<hr />
					<a class="list-group-item has-icon" @click="onClickKick">
						<AppJolticon icon="logout" notice />
						{{ $gettext(`Kick from room`) }}
					</a>
				</template>
			</template>
		</div>
	</div>
</template>
