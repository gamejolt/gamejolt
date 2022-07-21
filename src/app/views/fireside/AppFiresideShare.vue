<script lang="ts" setup>
import { useRouter } from 'vue-router';
import AppButton from '../../../_common/button/AppButton.vue';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { ShareModal } from '../../../_common/share/card/_modal/modal.service';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import {
	copyFiresideLink,
	getFiresideLink,
	useFiresideController,
} from '../../components/fireside/controller/controller';

defineProps({
	primary: {
		type: Boolean,
	},
});

const c = useFiresideController()!;

const router = useRouter();

function copyLink() {
	copyFiresideLink(c, router);
}

function showEllipsisMenu() {
	const url = getFiresideLink(c, router);
	if (!url) {
		return;
	}
	ShareModal.show({
		resource: 'fireside',
		url,
	});
}
</script>

<template>
	<div class="fireside-share">
		<div class="-col">
			<div class="-row -title">
				<AppJolticon class="-icon" icon="link" />
				<AppTranslate> Share this fireside! </AppTranslate>
			</div>
			<div class="-row">
				<AppButton block :primary="primary" :solid="primary" @click="copyLink">
					<AppTranslate>Copy link</AppTranslate>
				</AppButton>
				<AppButton icon="ellipsis-h" sparse @click="showEllipsisMenu" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-share
	width: 100%

.-col
	display: flex
	flex-direction: column
	gap: 7px

.-row
	display: flex
	flex-direction: row
	gap: 10px
	align-items: center

.-title
	&
	::v-deep(.jolticon)
		font-size: $font-size-small
		margin: 0

.-icon
	&
	::v-deep(.jolticon)
		color: var(--theme-fg-muted)
</style>
