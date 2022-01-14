<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { AuthModal } from '../../../../../_common/auth/auth-modal.service';
import { Community } from '../../../../../_common/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { FiresideAddModal } from '../../add-modal/add-modal.service';
import AppFiresideAvatarBase from '../_base/base.vue';

@Options({
	components: {
		AppFiresideAvatarBase,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideAvatarAdd extends Vue {
	@Prop({ type: Object, default: undefined })
	community!: Community | undefined;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	declare $refs: {
		header: HTMLDivElement;
	};

	get isCommunity() {
		return this.community !== undefined;
	}

	get isDisabled() {
		if (!this.user) {
			return false;
		}
		return !!this.community && !this.community.is_member;
	}

	async onClick() {
		if (!this.user) {
			AuthModal.show();
			return;
		}

		if (this.isDisabled) {
			return;
		}

		const fireside = await FiresideAddModal.show({ community: this.community });
		if (fireside instanceof Fireside) {
			this.$router.push(fireside.location);
		}
	}
}
</script>

<template>
	<app-fireside-avatar-base :class="{ '-disabled': isDisabled }" border-style="dashed">
		<template #avatar>
			<app-jolticon icon="add" />
		</template>

		<template #tag>
			<translate class="-start">START</translate>
		</template>

		<template #link>
			<a
				v-app-tooltip.touchable="
					isDisabled
						? $gettext(`Only members of this community can create a fireside in it.`)
						: null
				"
				@click="onClick"
			/>
		</template>
	</app-fireside-avatar-base>
</template>

<style lang="stylus" scoped>
.-disabled
	filter: brightness(0.4)

	&
	a
		cursor: not-allowed

.jolticon
	font-size: $jolticon-size * 2
</style>
