<script lang="ts" src="./chat"></script>

<template>
	<div id="shell-chat-pane">
		<div class="chat-sidebar">
			<template v-if="chat.populated">
				<nav class="shell-nav-inline platform-list inline">
					<ul>
						<li>
							<a :class="{ active: tab === 'chats' }" @click="tab = 'chats'">
								<translate>Chats</translate>
							</a>
						</li>
						<li>
							<a :class="{ active: tab === 'friends' }" @click="tab = 'friends'">
								<translate>Friends</translate>
								<span class="badge badge-subtle">
									{{ friendsCount }}
								</span>
							</a>
						</li>
					</ul>
				</nav>

				<div v-if="!friends" class="alert">
					<translate>No friends yet.</translate>
				</div>
				<app-chat-user-list v-else :users="tab === 'chats' ? chats : friends" show-pm />
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

#shell-chat-pane
	padding-top: 20px
</style>
