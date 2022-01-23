<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { Translate } from '../../../../_common/translate/translate.service';
import FormToken from '../../forms/token/token.vue';

@Options({
	components: {
		AppLoading,
		AppExpand,
		FormToken,
	},
})
export default class AppUserTokenModal extends mixins(BaseModal) {
	token = '';
	isChanging = false;

	async created() {
		try {
			const response = await Api.sendRequest('/web/dash/token');
			this.token = response.token;
		} catch (e) {
			showErrorGrowl(Translate.$gettext(`Couldn't get your token.`));
		}
	}

	showChangeForm() {
		this.isChanging = true;
	}

	onTokenChanged(formModel: { token: string }) {
		this.isChanging = false;
		this.token = formModel.token;
	}
}
</script>

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
					Your game token is like a special password you use to log into games that
					support high scores and achievements.
				</translate>
				[
				<app-link-help page="tokens" target="_blank">
					<translate>more info</translate>
				</app-link-help>
				]
			</p>

			<p class="text-muted small">
				<translate>
					Never share your account password. In fact, if a game asks for your password
					instead of your game token, please report it!
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
