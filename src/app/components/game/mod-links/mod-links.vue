<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { Game } from '../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';

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
		<a class="list-group-item has-icon" @click="tag('fnaf')" target="_blank">
			<app-jolticon icon="tag" />
			<span>Tag: #fnaf</span>
		</a>
		<a class="list-group-item has-icon" @click="tag('fangame')" target="_blank">
			<app-jolticon icon="tag" />
			<span>Tag: #fangame</span>
		</a>
		<a class="list-group-item has-icon" @click="tag('gjhot')" target="_blank">
			<app-jolticon icon="tag" />
			<span>Tag: #gjhot</span>
		</a>
		<a class="list-group-item has-icon" @click="untag('gjhot')" target="_blank">
			<app-jolticon icon="tag" />
			<span>Untag: #gjhot</span>
		</a>
		<a class="list-group-item has-icon" @click="tag('gjboost')" target="_blank">
			<app-jolticon icon="tag" />
			<span>Tag: #gjboost</span>
		</a>
		<a class="list-group-item has-icon" @click="tag('gjhome')" target="_blank">
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
