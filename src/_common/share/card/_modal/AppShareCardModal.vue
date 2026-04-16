<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppShareCardTile from '~common/share/card/AppShareCardTile.vue';
import { copyShareLink, ShareProvider, ShareResource } from '~common/share/share.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	resource: ShareResource;
	url: string;
};
const { resource, url } = defineProps<Props>();

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
	copyShareLink(url, resource);
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
