<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { UserModel } from '../../../../_common/user/user.model';

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
	isFriend: {
		type: Boolean,
	},
});

const emit = defineEmits({
	removefriend: () => true,
	unfollow: () => true,
});
</script>

<template>
	<section class="section fill-notice">
		<div class="container">
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
