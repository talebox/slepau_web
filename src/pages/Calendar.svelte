<script>
	let selected = new Date();

	function getDays(selected) {
		const month = selected.getMonth();
		const startOfWeekIndex = 0;
		let last = {
			date: new Date(selected.getFullYear(), selected.getMonth(), 1),
			outsider: false,
		};
		const days = [];

		while (last.date.getMonth() === month) {
			days.push(last);
			const date = new Date(last.date);
			date.setDate(last.date.getDate() + 1);
			last = { date, outsider: false };
		}

		while (days[0].date.getDay() !== startOfWeekIndex) {
			const date = new Date(days[0].date);
			date.setDate(days[0].date.getDate() - 1);
			days.unshift({
				date,
				outsider: true,
			});
		}

		last.outsider = true;
		while (days.length < 42) {
			days.push(last);
			last = { date: new Date(last.date), outsider: true };
			last.date.setDate(last.date.getDate() + 1);
		}

		return days;
	}

	$: days = getDays(selected);
</script>

<div class="c" />

<!-- {#each Array}
		<div class="i">{day.getDay()}</div>
	{/each} -->
<style>
	.c {
	}
</style>
