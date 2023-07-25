<script lang="ts" setup>
import { CSSProperties, ref, toRefs, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { styleChangeBg } from '../../../../_styles/mixins';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppUserCardHover from '../../../user/card/AppUserCardHover.vue';
import AppUserCreatorBadge from '../../../user/creator/AppUserCreatorBadge.vue';
import { User } from '../../../user/user.model';
import { useContentOwnerController } from '../../content-owner';

const props = defineProps({
	username: {
		type: String,
		required: true,
	},
});

const { username } = toRefs(props);
const { hydrator } = useContentOwnerController()!;

const user = ref<User | null>(null);

watch(username, () => _hydrateUser(), { immediate: true });

function _hydrateUser() {
	// Make sure we never execute a promise if we don't have to, it would break SSR.
	hydrator.useData<any>('username', username.value, data => {
		if (data !== null) {
			user.value = new User(data);
		}
	});
}

const iconStyles: CSSProperties = {
	position: `absolute`,
	right: `-4px`,
	bottom: `-4px`,
};
</script>

<template>
	<span
		:style="{
			display: `inline-block`,
			whiteSpace: `normal`,
		}"
	>
		<template v-if="user">
			<AppUserCardHover :user="user">
				<RouterLink :to="user.url">
					<span>
						<slot />
						{{ ' ' }}
						<span
							:style="{
								position: `relative`,
								display: `inline-block`,
							}"
						>
							<img
								:src="user.img_avatar"
								class="img-responsive"
								:style="{
									display: `inline`,
									height: `1.5em`,
									borderRadius: `50%`,
								}"
								alt=""
							/>
							<AppUserCreatorBadge v-if="user.is_creator" :style="iconStyles" />
							<AppJolticon
								v-else-if="user.is_verified"
								:style="{
									...iconStyles,
									...styleChangeBg('bg-offset'),
									borderRadius: `100%`,
								}"
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
