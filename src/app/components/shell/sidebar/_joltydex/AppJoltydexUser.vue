<script lang="ts">
import { PropType, ref, toRefs } from 'vue';
import AppOnHover from '../../../../../_common/on/AppOnHover.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { kThemeFg10 } from '../../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../../_common/user/user.model';
import { styleTextOverflow, styleWhen } from '../../../../../_styles/mixins';
import { kBorderRadiusBase } from '../../../../../_styles/variables';
import { useJoltydexStore } from '../../../../store/joltydex';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const { user } = toRefs(props);
const { selectedJoltydexUser } = useJoltydexStore();

const isInview = ref(false);
</script>

<template>
	<AppScrollInview
		:config="InviewConfig"
		:style="{
			marginTop: `2px`,
			marginBottom: `2px`,
			height: `56px`,
		}"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<template v-if="isInview">
			<AppOnHover v-slot="{ binding, hovered }">
				<a
					v-bind="binding"
					:style="[
						{
							display: `flex`,
							alignItems: `center`,
							padding: `0 4px`,
							margin: `0 -4px`,
							height: `100%`,
							borderRadius: kBorderRadiusBase.px,
							color: `inherit`,
							gap: `8px`,
							transition: `margin 150ms, padding 150ms`,
						},
						styleWhen(hovered || selectedJoltydexUser === user, {
							background: kThemeFg10,
						}),
						styleWhen(selectedJoltydexUser === user, {
							marginLeft: `calc(0px - var(--shell-content-sidebar-padding))`,
							paddingLeft: `var(--shell-content-sidebar-padding)`,
							borderTopLeftRadius: 0,
							borderBottomLeftRadius: 0,
						}),
					]"
					@click="selectedJoltydexUser = user"
				>
					<AppUserAvatarBubble
						:style="{ flex: `none`, width: '32px', height: '32px' }"
						:user="user"
						disable-link
						show-frame
					/>

					<div :style="[styleTextOverflow, { fontWeight: `bold` }]">
						@{{ user.username }}
					</div>
				</a>
			</AppOnHover>
		</template>
	</AppScrollInview>
</template>
