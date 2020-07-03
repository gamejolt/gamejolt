<template>
	<div
		class="chat-window-message"
		:class="{
			'chat-msg-type-normal': message.type === ChatMessage.TypeNormal,
			'chat-msg-type-system': message.type === ChatMessage.TypeSystem,
			'chat-window-message-not-combined': !message.combine,
			'chat-window-message-combined': message.combine,
			'-chat-message-queued': message._showAsQueued,
			'-chat-message-new': isNew,
		}"
	>
		<router-link v-if="!message.combine" class="chat-window-message-avatar" :to="message.user.url">
			<img class="img-responsive" :src="message.user.img_avatar" alt="" />
		</router-link>

		<div class="chat-window-message-container">
			<div class="chat-window-message-byline" v-if="!message.combine">
				<router-link class="chat-window-message-user link-unstyled" :to="message.user.url">
					{{ message.user.display_name }}
				</router-link>
				<span class="chat-window-message-username"> @{{ message.user.username }} </span>
				<span class="chat-window-message-time">
					<span v-if="!message._showAsQueued" v-app-tooltip="loggedOn">
						{{ message.logged_on | date('shortTime') }}
					</span>
					<span
						v-else-if="message._error"
						class="chat-window-message-byline-error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						class="chat-window-message-byline-notice"
						v-app-tooltip="$gettext(`Sending...`)"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</span>
			</div>

			<div class="chat-window-message-content-wrap">
				<template v-if="message.combine">
					<span
						v-if="!message._showAsQueued"
						class="chat-window-message-small-time"
						v-app-tooltip="loggedOn"
					>
						{{ message.logged_on | date('shortTime') }}
					</span>
					<span
						v-else-if="message._error"
						class="chat-window-message-queue-error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						class="chat-window-message-queue-notice"
						v-app-tooltip="$gettext(`Sending...`)"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</template>

				<app-content-viewer :source="message.content" :display-rules="displayRules" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
