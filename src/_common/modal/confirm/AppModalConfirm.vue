<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	message: string;
	title: string;
	buttonType: 'ok' | 'yes';
};
defineProps<Props>();

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
