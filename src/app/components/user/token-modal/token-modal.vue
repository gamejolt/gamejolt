<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
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
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppJolticon icon="token" big />
				<AppTranslate v-if="!isChanging">Your Game Token</AppTranslate>
				<AppTranslate v-else>Change Game Token</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p class="text-muted small">
				<AppTranslate>
					Your game token is like a special password you use to log into games that
					support high scores and achievements.
				</AppTranslate>
				[
				<AppLinkHelp page="tokens" target="_blank">
					<AppTranslate>more info</AppTranslate>
				</AppLinkHelp>
				]
			</p>

			<p class="text-muted small">
				<AppTranslate>
					Never share your account password. In fact, if a game asks for your password
					instead of your game token, please report it!
				</AppTranslate>
			</p>

			<AppExpand :when="!isChanging">
				<table class="table">
					<tbody>
						<tr>
							<th>Current Game Token</th>
							<td>
								<AppLoading v-if="!token" />
								<p v-else>
									<code>{{ token }}</code>
								</p>
							</td>
						</tr>
					</tbody>
				</table>
			</AppExpand>

			<AppExpand :when="isChanging">
				<FormToken :token="token" @submit="onTokenChanged" />
			</AppExpand>
		</div>

		<div class="modal-footer">
			<AppButton
				v-if="!isChanging"
				class="anim-fade-enter anim-fade-leave"
				@click="showChangeForm"
			>
				<AppTranslate>Change Game Token</AppTranslate>
			</AppButton>
		</div>
	</AppModal>
</template>
