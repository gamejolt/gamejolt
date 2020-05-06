<template>
	<app-scroll-scroller @scroll.native="onScroll">
		<div class="-container">
			<transition-group @enter="onMessageTransition">
				<div class="anim-fade-in no-animate-leave" v-for="message of messages" :key="message.id">
					<div class="-date-split" v-if="message.dateSplit">
						<span class="-inner">{{ message.loggedOn | date('mediumDate') }}</span>
					</div>

					<hr class="-hr" v-if="!message.dateSplit && !message.combine" />

					<app-chat-window-output-item :message="message" :room="room" />
				</div>
			</transition-group>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" src="./output.styl" scoped></style>

<script lang="ts" src="./output"></script>
