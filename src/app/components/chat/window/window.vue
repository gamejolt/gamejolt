<script lang="ts" src="./window"></script>

<template>
	<div class="chat-window-wrap">
		<div class="-chat-window-offset-left" />
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close chat. -->
		<div class="chat-window-back-close" @click="close" />
		<div class="chat-window">
			<div class="chat-window-back-close" @click="close" />

			<div class="chat-window-main">
				<!-- Window Header -->
				<div class="chat-window-header-wrap">
					<div class="chat-window-header fill-offset">
						<div class="chat-window-header-controls">
							<span
								@mouseenter="friendAddJolticonVersion = 2"
								@mouseleave="friendAddJolticonVersion = 1"
							>
								<app-button
									v-app-tooltip="
										room.isPmRoom
											? $gettext('Create Group Chat')
											: $gettext('Add Friends')
									"
									class="-header-control anim-fade-in"
									circle
									trans
									:icon="'friend-add-' + friendAddJolticonVersion"
									@click="room.isPmRoom ? addGroup() : addMembers()"
								/>
							</span>

							<app-button
								v-if="!room.isPmRoom"
								v-app-tooltip="
									isShowingUsers
										? $gettext('Hide Members')
										: $gettext('Show Members')
								"
								circle
								trans
								icon="users"
								class="-header-control anim-fade-in"
								@click="toggleUsers"
							/>

							<app-button
								v-app-tooltip="$gettext('Close Room')"
								class="-header-control"
								circle
								trans
								icon="remove"
								@click="close"
							/>
						</div>

						<!-- Animation scope. -->
						<div
							v-for="room of [room]"
							:key="room.id"
							class="chat-window-header-content"
						>
							<span
								v-if="!room.isPmRoom"
								class="chat-window-header-avatar avatar anim-fade-in-enlarge no-animate-xs"
							>
								<div class="-icon">
									<app-jolticon icon="users" />
								</div>
							</span>
							<router-link
								v-else-if="room.user"
								class="chat-window-header-avatar avatar anim-fade-in-enlarge no-animate-xs"
								:to="room.user.url"
							>
								<img class="-icon" :src="room.user.img_avatar" alt="" />
								<app-chat-user-online-status
									:is-online="room.user.isOnline"
									:size="16"
								/>
							</router-link>

							<h3 v-if="!room.isPmRoom" class="anim-fade-in-right no-animate-xs">
								{{ roomTitle }}
							</h3>
							<h3
								v-else-if="room.user"
								class="anim-fade-in-right no-animate-xs"
								:title="`${room.user.display_name} (@${room.user.username})`"
							>
								<router-link class="link-unstyled" :to="room.user.url">
									{{ roomTitle }}
								</router-link>
								<br />
								<small>@{{ room.user.username }}</small>
							</h3>

							<app-button
								v-if="!room.isPmRoom && isOwner"
								v-app-tooltip="$gettext('Edit Group')"
								class="-header-control anim-fade-in-right"
								circle
								trans
								icon="edit"
								@click="editTitle()"
							/>
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

				<div v-if="chat.currentUser" class="chat-window-send-container">
					<app-chat-window-send :room="room" />
				</div>
			</div>
		</div>
		<div
			class="-chat-window-offset-right"
			:class="{ '-has-content': !room.isPmRoom && isShowingUsers }"
		>
			<!-- Room Users -->
			<div v-if="!room.isPmRoom && isShowingUsers" class="chat-window-users">
				<div v-if="!Screen.isXs" class="chat-window-users-shadow" />

				<app-scroll-scroller class="chat-window-users-scroller">
					<template v-if="Screen.isXs">
						<br />
						<div class="nav-controls">
							<app-button block icon="chevron-left" @click="toggleUsers">
								<translate>Back to Chat</translate>
							</app-button>
						</div>
					</template>

					<div class="nav-heading">
						<translate>Members</translate>
						<span class="badge badge-subtle">
							{{ membersCount }}
						</span>
					</div>

					<app-chat-member-list v-if="users" :users="users.collection" />
				</app-scroll-scroller>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./window.styl" scoped></style>
