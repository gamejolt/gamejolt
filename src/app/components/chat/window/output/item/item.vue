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

			<div
				v-if="chat.currentUser && chat.currentUser.id === message.user.id"
				class="chat-window-message-options"
			>
				<app-popper>
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
					<div class="alert">
						<p v-if="isInviteSender">
							<translate>
								You have sent a group chat invite.
							</translate>
						</p>
						<p v-if="!isInviteSender">
							<translate>
								You have been invited to a group chat.
							</translate>
						</p>

						<app-button
							v-if="!isInviteSender"
							primary
							solid
							@click="acceptInvite(message.id)"
						>
							<translate>Accept</translate>
						</app-button>
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
