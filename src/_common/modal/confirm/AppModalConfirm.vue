<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../button/AppButton.vue';
import { $gettext } from '../../translate/translate.service';
import AppModal from '../AppModal.vue';
import { useModal } from '../modal.service';

defineProps({
	message: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	buttonType: {
		type: String as PropType<'ok' | 'yes'>,
		required: true,
	},
});

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<p>{{ message }}</p>
		</div>

		<div class="modal-footer">
			<AppButton primary solid @click="modal.resolve(true)">
				{{ buttonType === 'ok' ? $gettext('Ok') : $gettext('Yes') }}
			</AppButton>
			<AppButton trans @click="modal.resolve(false)">
				{{ buttonType === 'ok' ? $gettext('Cancel') : $gettext('No') }}
			</AppButton>
		</div>
	</AppModal>
</template>
