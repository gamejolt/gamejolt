<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../base';

@Options({})
export default class AppModalConfirm extends mixins(BaseModal) {
	@Prop(String) message!: string;
	@Prop(String) title!: string;
	@Prop(String) buttonType!: 'ok' | 'yes';

	ok() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<p>{{ message }}</p>
		</div>

		<div class="modal-footer">
			<app-button primary solid @click="ok">
				<translate v-if="buttonType === 'ok'">OK</translate>
				<translate v-else-if="buttonType === 'yes'">Yes</translate>
			</app-button>
			<app-button trans @click="cancel">
				<translate v-if="buttonType === 'ok'">Cancel</translate>
				<translate v-else-if="buttonType === 'yes'">No</translate>
			</app-button>
		</div>
	</app-modal>
</template>
