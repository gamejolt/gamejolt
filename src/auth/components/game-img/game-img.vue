import AppGameThumbnailImg from '../../../_common/game/thumbnail-img/thumbnail-img';
<template>
	<a id="cover-img-credits" class="flow-col" :href="gameUrl">
		<div class="mask">
			<p>{{ gameTitle }}</p>
			<div class="-image">
				<app-game-thumbnail-img :game="coverGame" />
			</div>
			<p>by {{ developerName }}</p>
		</div>
	</a>
</template>

<style scoped>
#cover-img-credits {
	position: absolute;
	right: 30px;
	bottom: 25px;

	background: #1f1f1f;
	border-radius: 8px;
	width: 220px;

	color: white;
}

#cover-img-credits:hover {
	border: none;
}

.mask {
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	border-radius: 8px;

	transition: 0.2s;
}

.mask:hover {
	background: rgba(200, 200, 200, 0.1);
}

.mask > p {
	margin: 5px;
}

.-image {
	width: 200px;
}

p:first-child {
	font-style: bold;
}

p:last-child {
	font-style: italic;
	font-size: 13px;
}
</style>

<script lang="ts" src="./game-img"></script>
