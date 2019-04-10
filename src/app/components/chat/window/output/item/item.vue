<template>
	<div
		class="chat-window-message"
		:class="{
			'chat-msg-type-normal': message.type === ChatMessage.TypeNormal,
			'chat-msg-type-system': message.type === ChatMessage.TypeSystem,
			'chat-window-message-not-combined': !message.combine,
			'chat-window-message-combined': message.combine,
			'chat-window-message-can-mod': canModerate,
		}"
	>
		<router-link v-if="!message.combine" class="chat-window-message-avatar" :to="message.user.url">
			<img class="img-responsive" :src="message.user.imgAvatar" alt="" />
		</router-link>

		<div class="chat-window-message-container">
			<div class="chat-window-message-byline" v-if="!message.combine">
				<router-link class="chat-window-message-user link-unstyled" :to="message.user.url">
					{{ message.user.displayName }}
				</router-link>
				<span class="chat-window-message-username">@{{ message.user.username }}</span>
				<span class="chat-window-message-time">
					<span :title="loggedOn">
						{{ message.loggedOn | date('shortTime') }}
					</span>
				</span>
			</div>

			<div v-if="canModerate" class="chat-window-message-mod-tools">
				<a class="link-muted" @click="muteUser" :title="$gettext('Mute User')">
					<app-jolticon icon="friend-remove-2" />
				</a>
			</div>

			<div class="chat-window-message-content-wrap">
				<template v-if="!shouldFadeCollapse">
					<div class="chat-window-message-content" lang="en" v-html="message.content"></div>
				</template>
				<template v-else>
					<app-fade-collapse
						:collapse-height="138"
						:is-open="isExpanded"
						@require-change="isCollapsable = $event"
						@expand="isExpanded = true"
					>
						<div class="chat-window-message-content" lang="en" v-html="message.content"></div>
					</app-fade-collapse>

					<p v-if="isCollapsable">
						<a class="hidden-text-expander" @click="isExpanded = !isExpanded"></a>
					</p>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
