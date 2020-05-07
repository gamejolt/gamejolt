<template>
	<app-scroll-scroller @scroll.native="onScroll">
		<div class="-container">
			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button trans @click="loadMore">
					<translate>Load More Messages</translate>
				</app-button>
			</div>
			<app-loading v-if="chat.loadingOlderMessages" class="loading-centered" />
			<transition-group @enter="onMessageTransition">
				<div
					class="anim-fade-in no-animate-leave"
					v-for="message of messages"
					:key="message.objectId"
				>
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
