<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppForumRules extends Vue {
	isShowingRules = false;
}
</script>

<template>
	<div class="alert full-bleed-xs">
		<p>
			We're archiving the forums and going <code>read only!</code> You'll be able to see old
			threads, but new topics and replies have been disabled.
		</p>
		<p>
			Visit the
			<RouterLink
				:to="{
					name: 'communities.view.overview',
					params: { path: 'gamejolt' },
				}"
			>
				Game Jolt community
			</RouterLink>
			for new questions and conversations.
		</p>
	</div>
</template>
