export function fuzzynumber(num: number) {
	// For testing.
	// number = 2900;
	// number = 2090;
	// number = 2009;

	// number = 20009;
	// number = 20090;
	// number = 20900;
	// number = 29000;

	// number = 200009;
	// number = 200090;
	// number = 200900;
	// number = 209000;
	// number = 290000;

	// number = 2000009;
	// number = 2000090;
	// number = 2000900;
	// number = 2009000;
	// number = 2090000;
	// number = 2900000;

	// number = 20000009;
	// number = 20000090;
	// number = 20000900;
	// number = 20009000;
	// number = 20090000;
	// number = 20900000;
	// number = 29000000;

	// number = 200000009;
	// number = 200000090;
	// number = 200000900;
	// number = 200009000;
	// number = 200090000;
	// number = 200900000;
	// number = 209000000;
	// number = 290000000;

	if (num >= 1000000000) {
		return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'g';
	}

	if (num >= 1000000) {
		return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
	}

	if (num >= 1000) {
		return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
	}

	return num;
}
