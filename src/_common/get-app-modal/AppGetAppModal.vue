<script lang="ts" setup>
import { kFontSizeLarge } from '../../_styles/variables';
import AppButton from '../button/AppButton.vue';
import AppIllustration from '../illustration/AppIllustration.vue';
import { illPointyThing } from '../illustration/illustrations';
import AppModal from '../modal/AppModal.vue';
import { useModal } from '../modal/modal.service';
import { $gettext } from '../translate/translate.service';

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
			<h2 class="modal-title">
				{{ $gettext(`Get the Game Jolt Desktop App`) }}
			</h2>
		</div>

		<div class="modal-body">
			<AppIllustration :asset="illPointyThing" />

			<div
				:style="{
					textAlign: `center`,
					fontSize: kFontSizeLarge.px,
					marginTop: `16px`,
					marginBottom: `32px`,
				}"
			>
				{{ $gettext(`You need the desktop app for this!`) }}
			</div>

			<AppButton solid block primary :to="{ name: 'landing.app' }">
				{{ $gettext(`Get the app`) }}
			</AppButton>
		</div>
	</AppModal>
</template>
