<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { configChargedStickers } from '../../../config/config.service';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import { User } from '../../user.model';
import AppUserVerifiedTick from '../../verified-tick/AppUserVerifiedTick.vue';
import AppUserAvatar from '../user-avatar.vue';

@Options({
	components: {
		AppUserAvatar,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppUserAvatarList extends Vue {
	@Prop(Array)
	users!: User[];

	@Prop(Boolean)
	sm?: boolean;

	@Prop(Boolean)
	inline?: boolean;

	get hasChargedStickers() {
		return configChargedStickers.value;
	}
}
</script>

<template>
	<div class="-list" :class="{ '-list-sm': sm, '-inline-list': inline }">
		<div
			v-for="user of users"
			:key="user.id"
			class="-user"
			:class="{
				'-user-sm': sm,
			}"
		>
			<AppUserAvatar
				v-app-tooltip="user.display_name + ' (@' + user.username + ')'"
				class="-avatar"
				:class="{
					'-avatar-sm': sm,
				}"
				:user="user"
			/>
			<AppUserVerifiedTick
				v-if="!sm"
				class="-tick"
				:class="{
					'-tick-round': !hasChargedStickers || user.is_creator !== true,
				}"
				:user="user"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-size = 40px
$-spacing = 4px
$-size-sm = 16px

.-list
	display: grid
	grid-template-columns: repeat(auto-fill, $-size)
	grid-gap: $-spacing * 2
	justify-content: space-between

.-list-sm
	position: relative
	flex: 1
	display: flex
	flex-wrap: wrap
	padding-top: $-spacing
	padding-bottom: $-spacing
	justify-content: normal
	grid-gap: 0

.-inline-list
	display: inline-flex

.-user
	position: relative

.-user-sm
	width: $-size-sm * 0.4
	height: $-size-sm
	margin: 0 3px 3px

.-avatar
	img-circle()
	change-bg('bg-subtle')
	pressy()

.-avatar-sm
	width: $-size-sm
	height: $-size-sm

.-tick
	position: absolute
	right: 0
	bottom: 0
	pointer-events: none

.-tick-round
	change-bg('bg')
	border-radius: 50%
</style>
