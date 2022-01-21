<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';
import { showSuccessGrowl } from '../../growls/growls.service';
import { Game } from '../game.model';

@Options({})
export default class AppGameModLinks extends Vue {
	@Prop(Object) game!: Game;

	Environment = Environment;

	async tag(tag: string) {
		// It won't return what site api expects for output, so gotta catch.
		try {
			await Api.sendRequest(`/games/tags/tag/${this.game.id}/${tag}`, null, {
				apiPath: '/moderate',
				processPayload: false,
			});
		} catch (_e) {
			showSuccessGrowl('Tagged the game.');
		}
	}

	async untag(tag: string) {
		// It won't return what site api expects for output, so gotta catch.
		try {
			await Api.sendRequest(`/games/tags/untag/${this.game.id}/${tag}`, null, {
				apiPath: '/moderate',
				processPayload: false,
			});
		} catch (_e) {
			showSuccessGrowl('Untagged the game.');
		}
	}
}
</script>

<template>
	<div class="list-group list-group-dark">
		<a class="list-group-item has-icon" target="_blank" @click="tag('fnaf')">
			<app-jolticon icon="tag" />
			<span>Tag: #fnaf</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('fangame')">
			<app-jolticon icon="tag" />
			<span>Tag: #fangame</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('gjhot')">
			<app-jolticon icon="tag" />
			<span>Tag: #gjhot</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="untag('gjhot')">
			<app-jolticon icon="tag" />
			<span>Untag: #gjhot</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('gjboost')">
			<app-jolticon icon="tag" />
			<span>Tag: #gjboost</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('gjhome')">
			<app-jolticon icon="tag" />
			<span>Tag: #gjhome</span>
		</a>
		<a
			class="list-group-item has-icon"
			:href="Environment.baseUrl + `/moderate/games/view/${game.id}`"
			target="_blank"
		>
			<app-jolticon icon="cog" />
			<span>Moderate Game</span>
		</a>
	</div>
</template>
