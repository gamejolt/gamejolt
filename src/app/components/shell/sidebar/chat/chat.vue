<script lang="ts" src="./chat"></script>

<template>
	<div id="shell-chat-pane">
		<div class="chat-sidebar">
			<template v-if="chat.populated">
				<nav class="shell-nav-inline platform-list inline">
					<ul>
						<li v-if="chats.length > 0">
							<a :class="{ active: tab === 'chats' }" @click="tab = 'chats'">
								<translate>Chats</translate>
							</a>
						</li>
						<li>
							<a
								:class="{ active: chats.length === 0 || tab === 'friends' }"
								@click="tab = 'friends'"
							>
								<translate>Friends</translate>
								<span class="badge badge-subtle">
									{{ friendsCountLocalized }}
								</span>
							</a>
						</li>
					</ul>
				</nav>

				<div
					v-if="chats.length === 0 || (tab === 'friends' && !friends.length)"
					class="nav-well"
				>
					<translate>No friends yet.</translate>
				</div>
				<app-chat-user-list v-else :entries="tab === 'chats' ? chats : friends" />
			</template>
			<template v-else-if="chat.connected">
				<app-loading centered :label="$gettext(`Loading your chats...`)" />
			</template>
			<template v-else>
				<app-illustration class="-no-chat" src="~img/ill/maintenance.svg">
					<p><translate>The chat server went away...</translate></p>
					<p><translate>It should be back shortly.</translate></p>
				</app-illustration>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

#shell-chat-pane
	padding-top: 20px

.-no-chat
	margin-left: 12px
	margin-right: 12px

	@media $media-md-up
		margin-left: 24px
		margin-right: 24px
</style>
