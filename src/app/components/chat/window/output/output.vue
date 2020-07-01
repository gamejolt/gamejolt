<template>
	<app-scroll-scroller @scroll.native="onScroll">
		<div class="-container anim-fade-in no-animate-leave">
			<div v-if="shouldShowIntro" class="-intro">
				<app-jolticon icon="user-messages" big />
				<div>
					<div>
						<translate>This is the beginning of your conversation with</translate>
						<router-link :to="room.user.url"> @{{ room.user.username }} </router-link>
					</div>
					<div>
						<translate>Say hello</translate>
						<span
							:class="'emoji emoji-' + introEmoji"
							:title="':' + introEmoji + ':'"
						></span>
					</div>
				</div>
			</div>

			<app-loading v-if="isLoadingOlder" class="loading-centered" />

			<div v-for="message of allMessages" :key="message.id">
				<div class="-date-split" v-if="message.dateSplit">
					<span class="-inner">{{ message.logged_on | date('mediumDate') }}</span>
				</div>

				<hr class="-hr" v-if="!message.dateSplit && !message.combine" />

				<app-chat-window-output-item
					:message="message"
					:room="room"
					:is-new="isNewMessage(message)"
				/>
			</div>

			<transition name="fade">
				<div
					v-if="!shouldScroll"
					class="-container-scroll-down-indicator"
					:class="{ '-container-scroll-down-indicator-new': hasNewMessages }"
				></div>
			</transition>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" src="./output.styl" scoped></style>

<script lang="ts" src="./output"></script>
