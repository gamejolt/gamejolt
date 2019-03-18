<template>
	<div v-if="isRouteBootstrapped">
		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
						<app-game-perms :game="game" required="devlogs">
							<app-post-add-button :game="game" @add="onPostAdded" />
						</app-game-perms>

						<app-nav-tab-list>
							<ul>
								<li>
									<router-link
										:to="{
											name: 'dash.games.manage.devlog',
											query: {},
										}"
										active-class="active"
										exact
									>
										<translate>Posts</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'dash.games.manage.devlog',
											query: {
												tab: 'draft',
											},
										}"
										active-class="active"
										exact
									>
										<translate>Draft Posts</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'dash.games.manage.devlog',
											query: {
												tab: 'scheduled',
											},
										}"
										active-class="active"
										exact
									>
										<translate>Scheduled Posts</translate>
									</router-link>
								</li>
							</ul>
						</app-nav-tab-list>

						<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
						<template v-else>
							<app-activity-feed
								v-if="feed.hasItems"
								:feed="feed"
								@edit-post="onPostEdited"
								@publish-post="onPostPublished"
								@remove-post="onPostRemoved"
							/>
							<div v-else class="alert">
								<template v-if="tab === 'active'">
									<p><translate>You haven't published any posts yet.</translate></p>
								</template>
								<template v-else-if="tab === 'draft'">
									<p><translate>You don't have any draft posts.</translate></p>
								</template>
								<template v-else-if="tab === 'scheduled'">
									<p><translate>You don't have any scheduled posts.</translate></p>
								</template>
							</div>
						</template>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./devlog" />
