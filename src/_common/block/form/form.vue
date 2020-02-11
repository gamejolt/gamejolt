<template>
	<app-form name="blockForm">
		<div>
			<p>
				<span v-translate="{ username: user.username }">
					Do you want to block
					<b>@%{ username }</b>
					?
				</span>
			</p>

			<p>
				<translate>
					They won't be able to follow you, send you a friend request or reply to your posts and
					comments.
				</translate>
			</p>

			<p>
				<app-link-help page="user-blocks" class="link-help">
					<translate>More info.</translate>
				</app-link-help>
			</p>
		</div>

		<app-form-button>
			<translate>Block</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./form"></script>
