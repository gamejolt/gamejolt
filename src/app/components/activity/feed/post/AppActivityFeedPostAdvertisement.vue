<script lang="ts">
import { computed } from 'vue';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { styleAbsoluteFill } from '../../../../../_styles/mixins';
import { kBorderRadiusLg } from '../../../../../_styles/variables';
import {
	kPostItemPaddingVertical,
	kPostItemPaddingXsVertical,
	PostContentContainerStyles,
	PostContentLeadStyles,
	PostFeedItemContainerStyles,
	PostHeaderAvatarStyles,
	PostHeaderBylineNameStyles,
	PostHeaderBylineStyles,
	PostHeaderContentStyles,
	PostHeaderMetaStyles,
	PostHeaderStyles,
} from '../../../post/post-styles';
import AppActivityFeedPostWrapper from './AppActivityFeedPostWrapper.vue';

const inviewConfig = new ScrollInviewConfig();
</script>

<script lang="ts" setup>
type Props = {
	href: string;
	avatarSrc: string;
	displayName: string;
	mediaSrc: string;
	leadContent: string;
	actionText?: string;
};

defineProps<Props>();

const emit = defineEmits<{ click: []; inview: [] }>();

const vPadding = computed(() =>
	Screen.isXs ? kPostItemPaddingXsVertical : kPostItemPaddingVertical
);
</script>

<template>
	<AppScrollInview :config="inviewConfig" @inview="emit('inview')">
		<div :style="PostFeedItemContainerStyles">
			<AppActivityFeedPostWrapper>
				<a
					:style="{
						...styleAbsoluteFill({ zIndex: 2 }),
					}"
					:href
					target="_blank"
					@click="emit('click')"
				/>
				<div :style="PostHeaderStyles">
					<div :style="PostHeaderContentStyles">
						<div :style="PostHeaderAvatarStyles">
							<img
								:src="avatarSrc"
								class="img-responsive"
								:style="{
									borderRadius: `50%`,
								}"
								alt=""
							/>
						</div>
						<div :style="PostHeaderBylineStyles">
							<div :style="PostHeaderBylineNameStyles(false)">
								{{ displayName }}
							</div>
						</div>
					</div>
					<div :style="PostHeaderMetaStyles">
						<span class="tag">
							{{ $gettext(`Promoted`) }}
						</span>
					</div>
				</div>

				<div
					:style="{
						marginTop: vPadding.px,
						overflow: `hidden`,
						borderRadius: kBorderRadiusLg.px,
					}"
				>
					<AppAspectRatio :ratio="1">
						<AppImgResponsive :src="mediaSrc" alt="Advertisement" />
					</AppAspectRatio>
				</div>

				<div :style="PostContentContainerStyles(false)">
					<div :style="PostContentLeadStyles" class="fireside-post-lead-content">
						{{ leadContent }}
					</div>
				</div>

				<div v-if="actionText" :style="{ marginTop: `24px` }">
					<AppButton block primary solid>{{ actionText }}</AppButton>
				</div>
			</AppActivityFeedPostWrapper>
		</div>
	</AppScrollInview>
</template>
