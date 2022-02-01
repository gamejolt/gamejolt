<script lang="ts" setup>
import { PropType } from 'vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import { copyShareLink, ShareProvider, ShareResource } from '../../share.service';
import AppShareCardTile from '../AppShareCardTile.vue';
import AppButton from '../../../button/AppButton.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';

const props = defineProps({
	resource: {
		type: String as PropType<ShareResource>,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
});

const modal = useModal<void>()!;

const providers: ShareProvider[] = [
	'facebook',
	'twitter',
	'reddit',
	'whatsapp',
	'fb_messenger',
	'email',
	'sms',
];

function copyLink() {
	copyShareLink(props.url, props.resource);
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
				<AppTranslate>Share to</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<div class="-grid">
				<AppShareCardTile
					v-for="i of providers"
					:key="i"
					class="-tile"
					:resource="resource"
					:url="url"
					:provider="i"
				/>
			</div>

			<AppButton class="-copy" @click="copyLink()">
				<AppTranslate>Copy link</AppTranslate>
			</AppButton>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
$-icon-size = 32px
$-base-padding = 8px

.modal-body
	display: flex
	flex-direction: column

.-grid
	display: grid
	grid-template-columns: 1fr 1fr
	grid-gap: $-base-padding
	margin-bottom: 24px

.-tile
	rounded-corners-lg()
	justify-content: flex-start
	padding: $-base-padding
</style>
