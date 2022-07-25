<script lang="ts" setup>
import { PropType } from 'vue';
import { illNoCommentsSmall } from '../../../../app/img/ill/illustrations';
import AppButton from '../../../button/AppButton.vue';
import AppIllustration from '../../../illustration/AppIllustration.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import AppUserFollowWidget from '../../follow/widget.vue';
import { User } from '../../user.model';

const props = defineProps({
	user: {
		type: Object as PropType<User>,
		required: true,
	},
});

const modal = useModal<boolean>()!;

// Freeze the value.
// eslint-disable-next-line vue/no-setup-props-destructure
const isFollowing = props.user.is_following;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<AppIllustration :asset="illNoCommentsSmall" />

			<AppSpacer vertical :scale="6" />

			<div class="text-center">
				<AppTranslate v-if="!isFollowing" :translate-params="{ user: '@' + user.username }">
					%{ user } isn't currently streaming. Follow them to be notified when they go
					live!
				</AppTranslate>
				<AppTranslate v-else :translate-params="{ user: '@' + user.username }">
					%{ user } isn't currently streaming! In the meantime, check out all the cool
					content on their profile.
				</AppTranslate>
			</div>

			<template v-if="!isFollowing">
				<AppSpacer vertical :scale="6" />

				<AppUserFollowWidget
					:user="user"
					primary
					block
					solid
					location="firesideOfflineFollow"
					@follow="modal.resolve(true)"
				/>
			</template>
		</div>
	</AppModal>
</template>
