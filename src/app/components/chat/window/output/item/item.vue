<script lang="ts" src="./item"></script>

<template>
	<div
		class="chat-window-message"
		:class="{
			'chat-msg-type-normal': message.type === ChatMessageType.MESSAGE,
			'chat-msg-type-invite': message.type === ChatMessageType.INVITE,
			'chat-window-message-not-combined': !message.combine,
			'chat-window-message-combined': message.combine,
			'chat-window-message-editing': isEditing,
			'-chat-message-queued': message._showAsQueued,
			'-chat-message-new': isNew,
		}"
		:style="{ 'background-color': isEditingColor }"
	>
		<router-link
			v-if="!message.combine"
			class="chat-window-message-avatar"
			:to="message.user.url"
		>
			<img class="img-responsive" :src="message.user.img_avatar" alt="" />
		</router-link>

		<div class="chat-window-message-container">
			<div v-if="!message.combine" class="chat-window-message-byline">
				<router-link class="chat-window-message-user link-unstyled" :to="message.user.url">
					{{ message.user.display_name }}
				</router-link>
				<span class="chat-window-message-username"> @{{ message.user.username }} </span>
				<span class="chat-window-message-time">
					<span v-if="!message._showAsQueued" v-app-tooltip="loggedOn.tooltip">
						{{ loggedOn.template }}
					</span>
					<span
						v-else-if="message._error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						class="chat-window-message-byline-error"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-byline-notice"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</span>
			</div>

			<!--
				The style prop makes sure the ... menu doesn't disappear while the options menu
				is open.
			-->
			<div
				v-if="chat.currentUser && chat.currentUser.id === message.user.id"
				class="chat-window-message-options"
				:style="{ visibility: optionsVisible ? 'visible !important' : undefined }"
			>
				<app-popper @show="onShowOptions" @hide="onHideOptions">
					<template #default>
						<a v-app-tooltip="$gettext('More Options')" class="link-muted">
							<app-jolticon icon="ellipsis-v" class="middle" />
						</a>
					</template>

					<template #popover>
						<div class="list-group">
							<a
								v-if="message.type === ChatMessageType.MESSAGE"
								class="list-group-item has-icon"
								@click="startEdit"
							>
								<app-jolticon icon="edit" />
								<translate>Edit Message</translate>
							</a>

							<a class="list-group-item has-icon" @click="removeMessage">
								<app-jolticon icon="remove" notice />
								<translate>Remove Message</translate>
							</a>
						</div>
					</template>
				</app-popper>
			</div>

			<div class="chat-window-message-content-wrap">
				<template v-if="message.combine">
					<span
						v-if="!message._showAsQueued"
						v-app-tooltip="loggedOn.tooltip"
						class="chat-window-message-small-time"
					>
						{{ loggedOn.template }}
					</span>
					<span
						v-else-if="message._error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						class="chat-window-message-queue-error"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-queue-notice"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</template>

				<template v-if="message.type === ChatMessageType.MESSAGE">
					<app-content-viewer :source="message.content" :display-rules="displayRules" />
				</template>
				<template v-else-if="message.type === ChatMessageType.INVITE">
					<div v-if="isInviteExpired" class="alert -invite">
						<div class="-invite-group-bubble -invite-group-bubble-loading">
							<app-jolticon icon="friend-remove-2" />
						</div>

						<div>
							<div class="-invite-title">
								<b><translate>This group invite expired</translate></b>
							</div>
							<p v-if="isInviteSender">
								<translate>
									The invite you sent is now invalid. You can invite this user
									again.
								</translate>
							</p>
							<p v-else>
								<translate>
									This invite is now invalid. You can ask the user to invite you
									again.
								</translate>
							</p>
						</div>
					</div>
					<div v-else class="alert -invite">
						<div
							v-if="loadedInvitedRoom"
							class="-invite-group-bubble"
							:class="{ '-invite-group-bubble-go': canEnterInviteRoom }"
							@click="enterInviteRoom"
						>
							<app-jolticon icon="users" />
						</div>
						<div v-else class="-invite-group-bubble -invite-group-bubble-loading" />
						<div>
							<div v-if="!loadedInvitedRoom" class="-invite-title-placeholder" />
							<div
								v-else
								class="-invite-title"
								:class="{ '-invite-title-go': canEnterInviteRoom }"
								@click="enterInviteRoom"
							>
								<b>{{ invitedRoomTitle }}</b>
							</div>
							<template v-if="isInviteSender">
								<p>
									<span v-translate="{ username: room.user.username }">
										You sent a group chat invite to <b>@%{ username }</b>.
									</span>
								</p>
								<app-button primary solid @click="enterInviteRoom">
									<translate>View Group</translate>
								</app-button>
							</template>
							<template v-else>
								<p>
									<span>
										<translate>
											You have been invited to a group chat.
										</translate>
									</span>
								</p>

								<app-button
									v-if="!isInviteMessageAccepted"
									primary
									solid
									:disabled="!loadedInvitedRoom"
									@click="acceptInvite(message.id)"
								>
									<translate>Join</translate>
								</app-button>
								<app-button
									v-else
									v-app-tooltip.right="$gettext(`You joined the group chat`)"
									primary
									solid
									disabled
								>
									<translate>Joined</translate>
								</app-button>
							</template>
						</div>
					</div>
				</template>

				<span
					v-if="editingState"
					v-app-tooltip.touchable="editingState.tooltip"
					class="-edited"
					:class="{ 'text-muted': !isEditing }"
				>
					<translate>{{ editingState.display }}</translate>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
