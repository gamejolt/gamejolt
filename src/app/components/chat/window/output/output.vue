<script lang="ts" src="./output"></script>

<template>
	<app-scroll-scroller @scroll.native="onScroll">
		<div class="-container anim-fade-in no-animate-leave">
			<div v-if="shouldShowIntro" class="-intro">
				<app-illustration src="~img/ill/no-chat.svg">
					<translate v-if="room.isPmRoom">
						Your friend is still loading. Encourage them with a message!
					</translate>
					<translate v-else>
						Waiting for friends to load in. Encourage them with a message!
					</translate>
				</app-illustration>
			</div>

			<app-loading v-if="isLoadingOlder" class="loading-centered" />

			<div v-app-observe-dimensions="tryAutoscroll">
				<div v-for="message of allMessages" :key="message.id">
					<div v-if="message.dateSplit" class="-date-split">
						<span class="-inner">{{ message.logged_on | date('mediumDate') }}</span>
					</div>

					<hr v-if="!message.dateSplit && !message.combine" class="-hr" />

					<app-chat-window-output-item
						:message="message"
						:room="room"
						:is-new="isNewMessage(message)"
					/>
				</div>
			</div>

			<transition name="fade">
				<div
					v-if="!shouldScroll"
					class="-container-scroll-down-indicator"
					:class="{ '-container-scroll-down-indicator-new': hasNewMessages }"
				/>
			</transition>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" src="./output.styl" scoped></style>

