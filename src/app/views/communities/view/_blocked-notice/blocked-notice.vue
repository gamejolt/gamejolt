<script lang="ts" src="./blocked-notice"></script>

<template>
	<div v-if="community.isBlocked" class="alert alert-notice">
		<p>
			<app-jolticon icon="notice" />
			<span>
				<b><translate>You have been blocked from this community.</translate></b>
				<br />
				<translate>The reason for your block is as follows:</translate>
			</span>
			<br />

			<em>
				<strong>
					{{ communityBlockReason }}
				</strong>
			</em>
		</p>

		<div>
			<translate>
				You are unable to create any new posts in this community until your block gets
				lifted or expires.
			</translate>
		</div>

		<div v-if="community.user_block && community.user_block.doesExpire">
			Your block will expire in
			<b><app-time-ago :date="community.user_block.expires_on" without-suffix /></b>
		</div>
	</div>
</template>
