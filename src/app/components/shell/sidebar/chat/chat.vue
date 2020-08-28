<script lang="ts" src="./chat"></script>

<template>
	<div id="shell-chat-pane">
		<div class="chat-sidebar">
			<div v-if="hasGroupRooms" class="chat-rooms-list">
				<div class="nav-heading first">
					<translate>Group Chat Rooms</translate>
				</div>

				<ul class="shell-nav">
					<li v-for="room of chat.groupRooms" :key="room.id">
						<a
							:class="{ active: chat.room && chat.room.id === room.id }"
							:title="room.getGroupTitle(chat)"
							@click="onRoomClicked(room.id)"
						>
							<span class="shell-nav-icon">
								<app-jolticon icon="users" />
							</span>
							<span class="shell-nav-label">
								{{ room.getGroupTitle(chat) }}
							</span>
						</a>
					</li>
				</ul>
			</div>

			<!-- Friends List -->
			<!-- Only include if not a guest -->
			<div v-if="chat.currentUser && chat.friendsPopulated" class="chat-friends-list">
				<div class="nav-heading">
					<translate>Friends</translate>
				</div>
				<nav class="shell-nav-inline platform-list inline">
					<ul>
						<li>
							<a
								:class="{ active: friendsTab === 'all' }"
								@click="friendsTab = 'all'"
							>
								<translate>All</translate>
								<span class="badge badge-subtle">
									{{ friendsCountAll }}
								</span>
							</a>
						</li>
						<li>
							<a
								:class="{ active: friendsTab === 'online' }"
								@click="friendsTab = 'online'"
							>
								<translate>Online</translate>
								<span class="badge badge-subtle">
									{{ friendsCountOnline }}
								</span>
							</a>
						</li>
					</ul>
				</nav>

				<div v-if="friendsTab === 'all' && !friends" class="alert">
					<translate>No friends yet.</translate>
				</div>
				<div v-else-if="friendsTab === 'online' && !friends" class="alert">
					<translate>No friends are online.</translate>
				</div>
				<app-chat-user-list v-else :users="friends" :show-pm="true" />
			</div>
		</div>
	</div>
</template>
