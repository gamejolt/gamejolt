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
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<div class="-auth-container">
				<AppAuthJoin />
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-auth-container
	max-width: 350px
	margin: 0 auto
</style>
