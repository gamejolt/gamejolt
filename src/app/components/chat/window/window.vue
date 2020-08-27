<template>
	<div class="chat-window-wrap">
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close chat. -->
		<div class="chat-window-back-close" @click="close"></div>
		<div class="chat-window">
			<div class="chat-window-back-close" @click="close"></div>

			<!-- Room Users -->
			<app-scroll-scroller
				v-if="!room.isPmRoom && isShowingUsers"
				class="fill-darkest chat-window-users"
			>
				<template v-if="Screen.isXs">
					<br />
					<div class="nav-controls">
						<app-button block icon="chevron-left" @click="toggleUsers">
							<translate>Back to Chat</translate>
						</app-button>
					</div>
				</template>

				<div class="nav-heading">
					<translate>Room Users</translate>
					<span
						class="badge"
						:class="{ 'badge-highlight': users && users.onlineCount > 0 }"
					>
						{{ users ? users.onlineCount : 0 | number }}
					</span>
				</div>

				<app-chat-user-list v-if="users" :room="room" :users="users.collection" />
			</app-scroll-scroller>

			<div class="chat-window-main">
				<!-- Window Header -->
				<div class="chat-window-header-wrap">
					<div class="chat-window-header fill-offset">
						<div class="chat-window-header-controls">
							<app-button
								v-if="!room.isPmRoom"
								circle
								trans
								icon="users"
								class="anim-fade-in"
								@click="toggleUsers"
							/>

							<app-button
								circle
								trans
								icon="remove"
								@click="close"
								v-app-tooltip="$gettext('Close Room')"
							/>
						</div>

						<!-- Animation scope. -->
						<div
							class="chat-window-header-content"
							v-for="room of [room]"
							:key="room.id"
						>
							<router-link
								class="chat-window-header-avatar avatar anim-fade-in-enlarge no-animate-xs"
								v-if="room.isPmRoom && room.user"
								:to="room.user.url"
							>
								<img :src="room.user.img_avatar" alt="" />
							</router-link>

							<h3 v-if="!room.isPmRoom" class="anim-fade-in-right no-animate-xs">
								{{ room.title }}
							</h3>
							<h3
								v-else-if="room.user"
								class="anim-fade-in-right no-animate-xs"
								:title="`${room.user.display_name} (@${room.user.username})`"
							>
								<router-link class="link-unstyled" :to="room.user.url">
									{{ room.user.display_name }}
								</router-link>
								<br />
								<small>@{{ room.user.username }}</small>
							</h3>
						</div>
					</div>
				</div>

				<!-- The v-for is a hack to make sure we destroy/recreate each
				time the room changes. -->
				<div class="chat-window-output fill-backdrop">
					<app-chat-window-output
						v-for="room of [room]"
						:key="room.id"
						class="chat-window-output-inner"
						:room="room"
						:messages="messages"
						:queued-messages="queuedMessages"
					/>
				</div>

				<div class="chat-window-send-container" v-if="chat.currentUser">
					<app-chat-window-send :room="room" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./window.styl" scoped></style>

<script lang="ts" src="./window"></script>
