<template>
	<app-form name="blockForm">
		<div>
			<p>
				<span v-translate="{ username: user.username }">
					Are you sure you want to block
					<b>@%{ username }</b>?
				</span>
			</p>

			<p>
				<translate>
					They won't be able to follow you, send you a friend request, or reply to your posts and
					comments.
				</translate>
			</p>

			<p>
				<app-link-help page="blocking-users" class="link-help">
					<translate>Learn more about what happens when you block a user</translate>
				</app-link-help>
			</p>
		</div>

		<br />

		<app-form-group
			name="removeComments"
			:label="$gettext(`Remove the user's comments from your profile and posts?`)"
		>
			<app-form-control-toggle class="pull-right" />
			<p class="help-block">
				<translate>
					All of their shouts on your profile and comments on your posts will be removed.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>Block User</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./form"></script>
