<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { BaseModal } from '../modal/base';
import AppAuthJoin from './join/join.vue';

@Options({
	components: {
		AppAuthJoin,
	},
})
export default class AppAuthModal extends mixins(BaseModal) {}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<div class="-auth-container">
				<app-auth-join />
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-auth-container
	max-width: 350px
	margin: 0 auto
</style>
