<script lang="ts" setup>
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { useContentOwnerController } from '~common/content/content-owner';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import AppUserCreatorBadge from '~common/user/creator/AppUserCreatorBadge.vue';
import { UserModel } from '~common/user/user.model';

type Props = {
	username: string;
};
const { username } = defineProps<Props>();

const { hydrator } = useContentOwnerController()!;

const user = ref<UserModel | null>(null);

watch(
	() => username,
	() => _hydrateUser(),
	{ immediate: true }
);

function _hydrateUser() {
	// Make sure we never execute a promise if we don't have to, it would break SSR.
	hydrator.useData<any>('username', username, data => {
		if (data !== null) {
			user.value = new UserModel(data);
		}
	});
}
</script>

<template>
	<span class="inline-block whitespace-normal">
		<template v-if="user">
			<AppUserCardHover :user="user">
				<RouterLink :to="user.url">
					<span>
						<slot />
						{{ ' ' }}
						<span class="relative inline-block">
							<img
								:src="user.img_avatar"
								class="img-responsive inline h-[1.5em] rounded-full"
								alt=""
							/>
							<AppUserCreatorBadge
								v-if="user.is_creator"
								class="absolute -right-[4px] -bottom-[4px]"
							/>
							<AppJolticon
								v-else-if="user.is_verified"
								class="change-bg-bg-offset absolute -right-[4px] -bottom-[4px] rounded-full"
								icon="verified"
							/>
						</span>
					</span>
				</RouterLink>
			</AppUserCardHover>
		</template>
		<!-- Placeholder until the user data is hydrated. -->
		<template v-else>
			<RouterLink :to="'/@' + username">
				<span :title="'@' + username">
					<slot />
				</span>
			</RouterLink>
		</template>
	</span>
</template>
