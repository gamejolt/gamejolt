<template>
	<div class="chat-sidebar fill-darkest">
		<!-- Friends List -->
		<!-- Only include if not a guest -->
		<div class="chat-friends-list" v-if="chat.currentUser && chat.friendsPopulated">
			<div class="nav-heading">
				<translate>Friends</translate>
			</div>
			<nav class="shell-nav-inline platform-list inline">
				<ul>
					<li>
						<a :class="{ active: friendsTab === 'all' }" @click="friendsTab = 'all'">
							<translate>All</translate>
							<span class="badge">
								{{ chat.friendsList.collection.length | number }}
							</span>
						</a>
					</li>
					<li>
						<a :class="{ active: friendsTab === 'online' }" @click="friendsTab = 'online'">
							<translate>Online</translate>
							<span class="badge">
								{{ chat.friendsList.onlineCount | number }}
							</span>
						</a>
					</li>
				</ul>
			</nav>

			<div class="alert" v-if="friendsTab === 'all' && !friends">
				<translate>No friends yet.</translate>
			</div>
			<div class="alert" v-else-if="friendsTab === 'online' && !friends">
				<translate>No friends are online.</translate>
			</div>
			<app-chat-user-list v-else :users="friends" :show-pm="true" />
		</div>
	</div>
</template>

<script lang="ts" src="./sidebar"></script>
