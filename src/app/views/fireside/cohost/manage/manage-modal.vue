<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../../../utils/array';
import { fuzzysearch } from '../../../../../utils/string';
import { sleep } from '../../../../../utils/utils';
import AppFiresideLiveTag from '../../../../../_common/fireside/AppFiresideLiveTag.vue';
import {
	inviteFiresideHost,
	removeFiresideHost,
} from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { BaseModal } from '../../../../../_common/modal/base';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { useChatStore } from '../../../../components/chat/chat-store';
import { ChatUser } from '../../../../components/chat/user';
import { FiresideController } from '../../../../components/fireside/controller/controller';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';

type ListTitle = 'Chat' | 'Friends';

const ListTitles: ListTitle[] = [
	'Chat', // formatting
	'Friends',
];

@Options({
	components: {
		AppUserAvatarImg,
		AppUserAvatarList,
		AppIllustration,
		AppNavTabList,
		AppFiresideLiveTag,
	},
})
export default class AppFiresideCohostManageModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	controller!: FiresideController;

	chatStore = useChatStore()!;

	filterQuery = '';
	usersProcessing: (ChatUser | User)[] = [];
	isOpen = true;

	activeList: ListTitle = 'Chat';

	readonly illNoCommentsSmall = illNoCommentsSmall;
	readonly ListTitles = ListTitles;

	get rtc() {
		return this.controller.rtc.value;
	}

	get users() {
		switch (this.activeList) {
			case 'Chat':
				return this.controller.chatUsers.value?.collection || [];

			case 'Friends':
				return this.chatStore.chat?.friendsList.collection || [];

			default:
				return [];
		}
	}

	get hostableUsers() {
		if (!this.rtc) {
			return [];
		}

		const currentHosts = this.rtc.hosts;
		return this.users
			.filter(i => !currentHosts.some(host => host.user.id === i.id))
			.sort((a, b) => stringSort(a.display_name, b.display_name));
	}

	get currentCohosts(): User[] {
		const hosts = this.rtc?.hosts || [];
		const listableHostIds = this.rtc?.listableHostIds;
		const myUserId = this.controller.user.value?.id;

		return hosts // formatting
			.filter(i => {
				if (i.user.id === myUserId) {
					return false;
				}
				return !i.needsPermissionToView || listableHostIds?.has(i.user.id);
			})
			.map(i => i.user)
			.sort((a, b) => stringSort(a.display_name, b.display_name));
	}

	get manageableUsers() {
		return [...this.currentCohosts, ...this.hostableUsers];
	}

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.manageableUsers;
		}

		const filter = this.filterQuery.toLowerCase();
		return this.manageableUsers.filter(
			i =>
				fuzzysearch(filter, i.display_name.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}

	unmounted() {
		this.isOpen = false;
	}

	isUserProcessing(user: ChatUser | User) {
		return this.usersProcessing.some(chatUser => chatUser.id === user.id);
	}

	isUserStreaming(user: ChatUser | User) {
		return (
			this.isHost(user) &&
			this.rtc?.listableStreamingUsers.some(i => i.userModel?.id === user.id)
		);
	}

	isHost(user: ChatUser | User): user is User {
		return user instanceof User;
	}

	async processUser(user: ChatUser | User) {
		if (this.usersProcessing.includes(user)) {
			return;
		}

		this.usersProcessing.push(user);

		try {
			const wasHost = this.isHost(user);
			if (wasHost) {
				await removeFiresideHost(this.controller.fireside, user.id);
			} else {
				await inviteFiresideHost(this.controller.fireside, user.id);
			}

			// We will get a grid message that will update the RTC host list.
			while (
				(wasHost && this.currentCohosts.includes(user as User)) ||
				(!wasHost && this.hostableUsers.includes(user as ChatUser))
			) {
				if (!this.isOpen) {
					break;
				}
				await sleep(250);
			}
		} finally {
			const index = this.usersProcessing.indexOf(user);
			if (index !== -1) {
				this.usersProcessing.splice(index, 1);
			}
		}
	}
}
</script>

<template>
	<AppModal>
		<template #default>
			<div class="modal-controls">
				<AppButton @click="modal.dismiss()">
					<AppTranslate>Close</AppTranslate>
				</AppButton>
			</div>

			<div class="modal-header">
				<h2 class="modal-title">
					<AppTranslate>Manage Hosts</AppTranslate>
				</h2>
			</div>

			<div class="modal-body">
				<div>
					<AppNavTabList class="-inline-menu">
						<ul>
							<li v-for="title of ListTitles" :key="title" class="-tab-item">
								<a
									class="-tab-item-inner"
									:class="{
										active: activeList === title,
									}"
									@click="activeList = title"
								>
									{{ title }}
								</a>
							</li>
						</ul>
					</AppNavTabList>

					<input
						v-model="filterQuery"
						class="-filter form-control"
						placeholder="Filter..."
					/>

					<AppIllustration v-if="filteredUsers.length === 0" :src="illNoCommentsSmall">
						<p>
							<AppTranslate>There are no people here.</AppTranslate>
						</p>
					</AppIllustration>
					<div v-else class="-user-list">
						<div v-for="user of filteredUsers" :key="user.id" class="-user-list-item">
							<div class="-avatar">
								<AppUserAvatarImg :user="user" />
							</div>

							<div class="-label">
								<div class="-name">
									{{ user.display_name }}
								</div>
								<div class="-username">@{{ user.username }}</div>
							</div>

							<div class="-action">
								<AppFiresideLiveTag v-if="isUserStreaming(user)" size="sm" />

								<AppButton
									:disabled="isUserProcessing(user)"
									:solid="isHost(user)"
									:primary="isHost(user)"
									@click="processUser(user)"
								>
									<AppTranslate v-if="!isHost(user)">Add</AppTranslate>
									<AppTranslate v-else>Remove</AppTranslate>
								</AppButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</AppModal>
</template>

<style lang="stylus" scoped>
$-v-padding = 15px
$-h-padding = 20px
$-height = 40px

.-filter
	margin: 8px 0

.modal-body
	padding-top: 0

.-inline-menu::v-deep(.tab-list)
	text-align: start
	padding: 0
	margin: 0

	&::after
		display: none

.-tab-item
	margin-right: 24px

	&:last-of-type
		margin-right: 0

.-tab-item-inner
	rounded-corners()
	position: relative
	border: 0
	margin-bottom: 8px
	padding-left: 0
	padding-right: 0
	padding-top: 0
	margin: 0
	color: var(--theme-fg-muted)
	transition: color 100ms $weak-ease-out

	&:hover
		background-color: unset

	&.active::after
		opacity: 1

	&::after
		change-bg('link')
		rounded-corners()
		content: ''
		position: absolute
		bottom: 2px
		left: 0
		right: 0
		height: 2px
		opacity: 0
		transition: opacity 100ms $weak-ease-out

.-user-list-item
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid

	&:last-child
		border-bottom: 0

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

.-action
	display: inline-flex
	grid-gap: 12px
	align-items: center
</style>
