<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { $gettext } from '../../../../_common/translate/translate.service';

defineProps({
	title: {
		type: String,
		default: undefined,
	},
	message: {
		type: String,
		required: true,
	},
});
const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
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
				{{
					$gettext(`Looks like your anti-virus program removed an executable we need to manage your
					game library.`)
				}}
			</p>

			<p>
				{{
					$gettext(`Sadly, it's common for anti-virus programs to quarantine legitimate programs
					like the Client that require access to your file system.`)
				}}
			</p>

			<p>
				{{
					$gettext(`There should be a way to mark the Client as trusted in your anti-virus program
					to restore functionality of the Client.`)
				}}
			</p>
		</div>
	</AppModal>
</template>
