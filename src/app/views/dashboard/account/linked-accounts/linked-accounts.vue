<script lang="ts" src="./linked-accounts"></script>

<template>
	<div>
		<div class="row linked-accounts-list">
			<div class="col-md-8 col-lg-6">
				<app-linked-account
					:account="facebookAccount"
					:disabled="loading"
					provider="facebook"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<app-linked-account
					:account="twitterAccount"
					:disabled="loading"
					provider="twitter"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<app-linked-account
					:account="googleAccount"
					:disabled="loading"
					provider="google"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<app-linked-account
					:account="twitchAccount"
					:disabled="loading"
					provider="twitch"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<app-linked-account
					:account="tumblrAccount"
					:disabled="loading"
					provider="tumblr"
					show-tumblr-blog
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
					@link-tumblr-blog="onLinkTumblrBlog"
					@unlink-tumblr-blog="onUnlinkTumblrBlog"
				/>
			</div>
		</div>
	</div>
</template>
