<script lang="ts" src="./list"></script>

<template>
	<ol class="score-list list-unstyled">
		<li
			v-for="(score, i) of scores"
			:key="score.id"
			class="score-list-item clearfix anim-fade-in-up no-animate-leave"
		>
			<div class="score-list-media">
				<app-user-card-hover :user="score.user">
					<app-user-avatar :user="score.user" />
				</app-user-card-hover>
			</div>

			<div class="score-list-content">
				<div class="score-list-rank">
					<span class="score-list-rank-sign">#</span>
					{{ ((startRank || 1) + (step ? i * step : i)) | number }}
				</div>
				<div class="score-list-title" :title="score.score">
					{{ score.score }}
				</div>
				<div class="score-list-user">
					<template v-if="score.user">
						<router-link :to="score.user.url">
							{{ score.user.display_name }}
							<app-user-verified-tick :user="score.user" />
						</router-link>
						<small class="text-muted">@{{ score.user.username }}</small>
					</template>
					<template v-if="!score.user">
						{{ score.guest }}
						<em class="text-muted small">
							(
							<translate>scores.guest</translate>
							)
						</em>
					</template>
				</div>
				<div class="score-list-time text-muted small">
					<app-time-ago :date="score.logged_on" />
				</div>
			</div>
		</li>
	</ol>
</template>

<style lang="stylus" src="./list.styl" scoped></style>
