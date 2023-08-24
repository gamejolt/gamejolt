<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../button/AppButton.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import AppUserFollowButton from '../../follow/AppUserFollowButton.vue';
import AppUserAvatarImg from '../../user-avatar/AppUserAvatarImg.vue';
import { UserModel } from '../../user.model';

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const modal = useModal<boolean>()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<div class="-user-info">
				<div class="-avatar">
					<AppUserAvatarImg :user="user" />
				</div>
				<AppSpacer horizontal :scale="2" />
				<div class="-text">
					<AppTranslate :translate-params="{ user: '@' + user.username }">
						%{ user } invites you to follow them!
					</AppTranslate>
				</div>
			</div>

			<AppSpacer vertical :scale="6" />

			<AppUserFollowButton
				:user="user"
				block
				solid
				location="inviteFollow"
				@follow="modal.resolve(true)"
			/>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-user-info
	display: flex
	flex-direction: row
	align-items: center

.-avatar
	width: 48px

.-text
	font-size: 17px
	font-weight: 700
	line-height: 23px
</style>
