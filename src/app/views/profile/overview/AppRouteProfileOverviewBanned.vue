<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppExpand from '~common/expand/AppExpand.vue';
import { UserModel } from '~common/user/user.model';

type Props = {
	user: UserModel;
	isFriend?: boolean;
};
const { user, isFriend } = defineProps<Props>();

const emit = defineEmits<{
	removefriend: [];
	unfollow: [];
}>();
</script>

<template>
	<section class="section fill-notice">
		<div class="gj-container">
			<h2 class="sans-margin-top">
				{{ $gettext(`This account is banned.`) }}
			</h2>

			<AppExpand :when="isFriend">
				<p>
					<strong>
						{{ $gettext(`This user was your friend.`) }}
					</strong>
					<br />
					{{
						$gettext(
							`If you remove them from your friends list, you will no longer be able to access your chat history with them.`
						)
					}}
				</p>

				<AppButton solid @click="emit('removefriend')">
					{{ $gettext(`Remove friend`) }}
				</AppButton>
			</AppExpand>

			<AppExpand :when="user.is_following">
				<!-- Create some padding -->
				<template v-if="isFriend">
					<br />
					<br />
				</template>

				<p>
					<strong>
						{{ $gettext(`You were following this user.`) }}
					</strong>
					<br />
					{{
						$gettext(
							`If you unfollow them now, you won't be able to follow them again.`
						)
					}}
				</p>

				<AppButton solid @click="emit('unfollow')">
					{{ $gettext(`Unfollow`) }}
				</AppButton>
			</AppExpand>
		</div>
	</section>
</template>
