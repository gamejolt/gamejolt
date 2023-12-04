<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue';
import AppButton from '../../../../button/AppButton.vue';
import AppModal from '../../../../modal/AppModal.vue';
import { useModal } from '../../../../modal/modal.service';
import AppFormContentEditorLink from './AppFormContentEditorLink.vue';
import { LinkData } from './link-modal.service';

const props = defineProps({
	selectedText: {
		type: String,
		required: true,
	},
});

const { selectedText } = toRefs(props);
const modal = useModal()!;

const linkData = ref<LinkData>({
	href: '',
	title: '',
});

onMounted(() => {
	// Preset the href when the input looks like a url
	if (isValidUrl(selectedText.value)) {
		linkData.value.href = selectedText.value;
	}
});

function isValidUrl(text: string) {
	try {
		// This will throw if text is not a valid URL.
		new URL(text);
		return true;
	} catch (error) {
		return false;
	}
}

function onSubmit(data: LinkData) {
	if (!data.title) {
		data.title = data.href;
	}

	if (!isValidUrl(data.href)) {
		// Insert protocol if none given
		if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(data.href)) {
			data.href = '//' + data.href;
		}
	}

	modal.resolve(data);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<AppFormContentEditorLink :link-data="linkData" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
