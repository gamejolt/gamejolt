<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<app-jolticon icon="token" big />
				<translate v-if="!isChanging">Your Game Token</translate>
				<translate v-else>Change Game Token</translate>
			</h2>
		</div>

		<div class="modal-body">
			<p class="text-muted small">
				<translate>
					Your game token is like a special password you use to log into games that support high
					scores and achievements.
				</translate>
				[
				<app-link-help page="tokens" target="_blank">
					<translate>more info</translate>
				</app-link-help>
				]
			</p>

			<p class="text-muted small">
				<translate>
					Never share your account password. In fact, if a game asks for your password instead of
					your game token, please report it!
				</translate>
			</p>

			<app-expand :when="!isChanging">
				<table class="table">
					<tbody>
						<tr>
							<th>Current Game Token</th>
							<td>
								<app-loading v-if="!token" />
								<p v-else>
									<code>{{ token }}</code>
								</p>
							</td>
						</tr>
					</tbody>
				</table>
			</app-expand>

			<app-expand :when="isChanging">
				<form-token :token="token" @submit="onTokenChanged" />
			</app-expand>
		</div>

		<div class="modal-footer">
			<app-button
				v-if="!isChanging"
				class="anim-fade-enter anim-fade-leave"
				@click="showChangeForm"
			>
				<translate>Change Game Token</translate>
			</app-button>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./token-modal"></script>
