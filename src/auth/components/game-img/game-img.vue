import { ThemeStore } from '../../../_common/theme/theme.store';
<template>
	<div id="cover-img-credits">
		<div class="flow-col">
			<a class="link-unstyled -title" :href="gameUrl">{{ gameTitle }}</a>
			<a class="link-muted -dev" :href="devUrl"
				>by <strong>{{ developerName }}</strong></a
			>
			<span class="text-muted -follows">{{ gameFollows }} followers</span>
		</div>
		<a class="-img" :href="gameUrl">
			<app-game-thumbnail-img :game="coverGame" />
		</a>
	</div>
</template>

<style scoped>
#cover-img-credits {
	position: fixed;
	right: 17px;
	bottom: 0;
	padding: 5px;
	margin: 20px;

	display: flex;

	background: #262b2b;
	border-radius: 8px;
}

#cover-img-credits a.-title:hover {
	text-decoration: underline;
}

#cover-img-credits {
	text-align: right;
}

#cover-img-credits a:hover {
	border-bottom: none;
}

.-img {
	width: 145px;
	margin-left: 10px;
	transition: 0.25s;
	border-radius: 8px;
}

.-img:hover {
	/* box-shadow: lightgray 0px 0px 2px; */

	box-shadow: 0px 0px 3px var(--theme-bi-bg) !important;
}

.flow-col {
	display: flex;
	flex-flow: column;
	align-content: start;
	/* flex-flow: column; */
}

.-title {
	font-weight: 700;
	margin: 3px;
}

.-dev {
	font-size: 13px;
	margin: 3px;
}

.-follows {
	font-size: 13px;
}

/* .mask {
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	border-radius: 8px;

	transition: 0.2s;
} */

/* .mask:hover {
	background: rgba(200, 200, 200, 0.1);
} */

/* .mask > p {
	margin: 5px;
} */

/* .-image {
	width: 200px;
} */

/* p:first-child {
	font-style: bold;
}

p:last-child {
	font-style: italic;
	font-size: 13px;
} */
</style>

<script lang="ts" src="./game-img"></script>
