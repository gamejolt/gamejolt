<template>
	<app-card>
		<div class="-icon">
			<app-jolticon big :icon="providerIcon" />
		</div>

		<div class="-body">
			<h5>
				<translate>{{ providerName }}</translate>
			</h5>

			<template v-if="!isAccountSet">
				<p>
					<small class="text-muted">
						<translate>Not linked.</translate>
					</small>
				</p>

				<app-button v-if="!preview" primary :disabled="disabled" icon="link" @click="onLink()">
					<translate>Link Now</translate>
				</app-button>
			</template>
			<template v-else>
				<p>
					<strong v-if="platformLink">
						<a :href="platformLink" target="_blank">
							{{ account.name }}
						</a>
					</strong>
					<span v-else>
						{{ account.name }}
					</span>
				</p>

				<div v-if="!preview">
					<app-button :disabled="disabled" @click="onSync()">
						<translate>Sync</translate>
					</app-button>
					<app-button trans :disabled="disabled" @click="onUnlink()">
						<translate>Unlink</translate>
					</app-button>
				</div>

				<div v-if="showTumblrBlog" class="-tumblr-blog">
					<br />
					<template v-if="account.tumblrSelectedBlog">
						<p>
							<strong>
								<a :href="account.tumblrSelectedBlog.url" target="_blank">
									{{ account.tumblrSelectedBlog.title }}
								</a>
							</strong>
						</p>
						<app-button :disabled="disabled" @click="onSelectTumblrBlog">
							<translate>Change Blog</translate>
						</app-button>
						<app-button
							:disabled="disabled"
							v-if="account.tumblrSelectedBlog"
							@click="onUnlinkTumblrBlog"
							trans
						>
							<translate>Unlink Blog</translate>
						</app-button>
					</template>
					<template v-else>
						<div class="alert alert-notice">
							<translate>
								Before you can publish to Tumblr, you have to select a blog within your Tumblr
								account that you'd like to use.
							</translate>
						</div>
						<app-button :disabled="disabled" @click="onSelectTumblrBlog">
							<translate>Select Blog</translate>
						</app-button>
					</template>
				</div>
			</template>

			<slot />
		</div>
	</app-card>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-body
	margin-left: 70px

	> h5
		margin: 0
		font-weight: bold

.-facebook-page, .-tumblr-blog
	> h5
		margin-top: 20px
		margin-bottom: 0
		font-weight: bold
</style>

<script lang="ts" src="./linked-account"></script>
