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

<script lang="ts" src="./mod-links" />
