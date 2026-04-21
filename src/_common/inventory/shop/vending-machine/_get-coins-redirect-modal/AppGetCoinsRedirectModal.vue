<script lang="ts" setup>
import { routeUrlQuests } from '~app/views/quests/quests.route';
import AppButton from '~common/button/AppButton.vue';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illMobileKikkerstein } from '~common/illustration/illustrations';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { $gettext } from '~common/translate/translate.service';

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
			<h2 class="modal-title sans-margin-bottom">
				{{ $gettext(`Looking for Coins?`) }}
			</h2>
		</div>

		<div class="modal-body">
			<AppIllustration :asset="illMobileKikkerstein" />

			<p class="text-center">
				{{ $gettext(`You can earn Coins by completing quests!`) }}
			</p>

			<AppSpacer vertical :scale="4" />

			<a :href="routeUrlQuests()" @click="modal.resolve(true)">
				<AppButton block solid primary>
					{{ $gettext(`View current quests`) }}
				</AppButton>
			</a>
		</div>
	</AppModal>
</template>
