<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';

@Options({})
export default class AppClientAntiVirusModal extends mixins(BaseModal) {
	@Prop(String)
	title?: string;

	@Prop(String)
	message!: string;
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
			<h2 v-if="title" class="modal-title">
				{{ title }}
			</h2>

			<p>
				<strong>{{ message }}</strong>
			</p>
		</div>

		<div class="modal-body">
			<p>
				<AppTranslate>
					Looks like your anti-virus program removed an executable we need to manage your game
					library.
				</AppTranslate>
			</p>

			<p>
				<AppTranslate>
					Sadly, it's common for anti-virus programs to quarantine legitimate programs like the
					Client that require access to your file system.
				</AppTranslate>
			</p>

			<p>
				<AppTranslate>
					There should be a way to mark the Client as trusted in your anti-virus program to restore
					functionality of the Client.
				</AppTranslate>
			</p>
		</div>
	</AppModal>
</template>
