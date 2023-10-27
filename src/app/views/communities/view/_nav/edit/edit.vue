<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Vue } from 'vue-property-decorator';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { useCommunityRouteStore } from '../../view.store';

@Options({
	components: {
		AppCommunityPerms,
	},
})
export default class AppNavEdit extends Vue {
	routeStore = setup(() => useCommunityRouteStore())!;

	@Emit('change-section') emitChangeSection(_path: string) {}

	get community() {
		return this.routeStore.community;
	}

	onChangeSection(path: string) {
		this.emitChangeSection(path);
	}
}
</script>

<template>
	<nav class="platform-list">
		<ul>
			<li @click.capture="onChangeSection('communities.view.edit.details')">
				<router-link
					:to="{
						name: 'communities.view.edit.details',
						params: {
							id: community.id,
						},
					}"
					exact-active-class="active"
				>
					<AppTranslate>Details</AppTranslate>
				</router-link>
			</li>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-channels,community-competitions"
				either
				@click.capture="onChangeSection('communities.view.edit.channels.list')"
			>
				<router-link
					:to="{
						name: 'communities.view.edit.channels.list',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<AppTranslate>Channels</AppTranslate>
				</router-link>
			</AppCommunityPerms>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-games"
				@click.capture="onChangeSection('communities.view.edit.games')"
			>
				<router-link
					:to="{
						name: 'communities.view.edit.games',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<AppTranslate>Games</AppTranslate>
				</router-link>
			</AppCommunityPerms>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-moderators"
				@click.capture="onChangeSection('communities.view.edit.moderators')"
			>
				<router-link
					:to="{
						name: 'communities.view.edit.moderators',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<AppTranslate>Collaborators</AppTranslate>
				</router-link>
			</AppCommunityPerms>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-blocks"
				@click.capture="onChangeSection('communities.view.edit.blocks')"
			>
				<router-link
					:to="{
						name: 'communities.view.edit.blocks',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					<AppTranslate>Blocked Users</AppTranslate>
				</router-link>
			</AppCommunityPerms>
			<AppCommunityPerms tag="li" :community="community" required="community-activity">
				<router-link
					:to="{
						name: 'communities.view.edit.activity',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
					@click.capture="onChangeSection('communities.view.edit.blocks')"
				>
					<AppTranslate>Audit Log</AppTranslate>
				</router-link>
			</AppCommunityPerms>
		</ul>
	</nav>
</template>

<style lang="stylus" scoped>
.platform-list
	margin-left: 12px
</style>
