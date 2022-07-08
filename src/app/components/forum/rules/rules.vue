<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/AppExpand.vue';

@Options({
	components: {
		AppExpand,
	},
})
export default class AppForumRules extends Vue {
	isShowingRules = false;
}
</script>

<template>
	<div class="alert full-bleed-xs">
		<p>
			<!-- TODO -->
			<AppTranslate>PUT SUNSETTING MESSAGE HERE!</AppTranslate>
		</p>
		<p>
			<a @click="isShowingRules = !isShowingRules">
				<AppTranslate>Read through the rules before posting on the forums.</AppTranslate>
			</a>
		</p>

		<AppExpand :when="isShowingRules">
			<hr />

			<h5 class="sans-margin-top">
				<AppTranslate>Forum Rules</AppTranslate>
			</h5>

			<ol>
				<li>
					<b><AppTranslate>Keep it Nice</AppTranslate></b>
					-
					<AppTranslate>
						We're here to help each other as gamers and developers, not to pick fights.
					</AppTranslate>
				</li>
				<li>
					<b><AppTranslate>No Advertising</AppTranslate></b>
					-
					<AppTranslate>
						This is not the place to post news about your games. Game Jolt has devlogs
						for everyone to use. You can post about game ideas you may have, but only
						post in the respective channel.
					</AppTranslate>
				</li>
				<li>
					<b><AppTranslate>No Spamming</AppTranslate></b>
					-
					<AppTranslate>
						Most people these days have busy lives, so I think the last thing we need is
						to open up a thread just to find a bunch of poop in word form.
					</AppTranslate>
				</li>
				<li>
					<b><AppTranslate>Keep it Safe for Work</AppTranslate></b>
					-
					<AppTranslate>
						We'd like to keep the forums safe for younger folks to read through. Plus,
						how would people be able to slack off at work if we don't keep it safe?
					</AppTranslate>
				</li>
				<li>
					<b><AppTranslate>Be Awesome</AppTranslate></b>
					-
					<AppTranslate>We have no time for boring people.</AppTranslate>
				</li>
				<li>
					<b><AppTranslate>Additional Rules</AppTranslate></b>
					-
					<AppTranslate>
						Each channel has some additional rules. Be sure to read them and follow them
						while posting.
					</AppTranslate>
				</li>
			</ol>
		</AppExpand>
	</div>
</template>
