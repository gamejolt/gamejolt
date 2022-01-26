<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../modal/base';
import { copyShareLink, ShareProvider, ShareResource } from '../../share.service';
import AppShareCardTile from '../_tile/tile.vue';

@Options({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCardModal extends mixins(BaseModal) {
	@Prop({ type: String, required: true })
	resource!: ShareResource;

	@Prop({ type: String, required: true })
	url!: string;

	readonly providers: ShareProvider[] = [
		'facebook',
		'twitter',
		'reddit',
		'whatsapp',
		'fb_messenger',
		'email',
		'sms',
	];

	copyLink() {
		copyShareLink(this.url, this.resource);
	}
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
