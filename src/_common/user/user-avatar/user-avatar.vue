<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { User } from '../user.model';
import AppUserAvatarImg from './img/img.vue';

@Options({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppUserAvatar extends Vue {
	@Prop(Object)
	user!: User;

	@Prop(String)
	link?: string;

	@Prop(Boolean)
	disableLink!: boolean;

	get href() {
		if (this.disableLink || !this.user) {
			return undefined;
		}

		if (!this.link) {
			return Environment.wttfBaseUrl + this.user.url;
		} else if (this.link === 'dashboard') {
			return Environment.wttfBaseUrl;
		} else if (this.link === 'fireside') {
			return Environment.firesideBaseUrl + '/@' + this.user.username;
		}
	}
}
</script>

<template>
	<Component :is="href ? 'a' : 'div'" v-if="user" class="user-avatar" :href="href">
		<AppUserAvatarImg :user="user" />
	</Component>
	<AppUserAvatarImg v-else />
</template>

<style lang="stylus" scoped>
.user-avatar
	display: block
	position: relative
</style>
