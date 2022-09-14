<script lang="ts">
import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppUserCardHover from '../../../../user/card/AppUserCardHover.vue';
import AppUserCreatorBadge from '../../../../user/creator/AppUserCreatorBadge.vue';
import { User } from '../../../../user/user.model';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../../content-owner';

@Options({
	components: {
		AppUserCardHover,
		AppUserCreatorBadge,
	},
})
export default class AppContentViewerMention extends Vue {
	@Prop(String)
	username!: string;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	user: User | null = null;

	private hydrateUser() {
		// Make sure we never execute a promise if we don't have to, it would break SSR.
		this.owner.hydrator.useData<any>('username', this.username, data => {
			if (data !== null) {
				this.user = new User(data);
			}
		});
	}

	created() {
		this.hydrateUser();
	}

	@Watch('username')
	onUsernameChanged() {
		this.hydrateUser();
	}
}
</script>

<template>
	<span class="user-mention">
		<template v-if="user">
			<AppUserCardHover :user="user">
				<router-link :to="user.url">
					<span>
						<slot />
						{{ ' ' }}
						<span class="avatar-container">
							<img
								:src="user.img_avatar"
								class="img-responsive mention-avatar-img"
								alt=""
							/>
							<AppUserCreatorBadge v-if="user.is_creator" class="mention-creator" />
							<AppJolticon
								v-else-if="user.is_verified"
								class="mention-verified"
								icon="verified"
							/>
						</span>
					</span>
				</router-link>
			</AppUserCardHover>
		</template>
		<!-- Placeholder until the user data is hydrated: -->
		<template v-else>
			<router-link :to="'/@' + username">
				<span :title="'@' + username">
					<slot />
				</span>
			</router-link>
		</template>
	</span>
</template>

<style lang="stylus" scoped>
.user-mention
	display: inline-block
	white-space: normal

.avatar-container
	position: relative
	display: inline-block

.mention-avatar-img
	display: inline
	height: 1.5em
	img-circle()

.mention-creator
.mention-verified
	position: absolute
	right: -4px
	bottom: -4px

.mention-verified
	change-bg('bg-offset')
	border-radius: 100%
</style>
