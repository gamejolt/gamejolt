<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-lg-9">
					<app-ad-widget size="leaderboard" placement="top" />
					<app-ad-widget size="rectangle" placement="content" />

					<div class="alert" style="height: 2500px;" />

					<app-ad-widget size="rectangle" placement="content" />
					<app-ad-widget size="rectangle" placement="content" />
				</div>

				<div class="col-lg-3">
					<app-ad-widget size="rectangle" placement="side" />
					<app-scroll-affix>
						<app-ad-widget size="video" placement="side" />
					</app-scroll-affix>
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./adtest"></script>
