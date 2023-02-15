export function polarToCartesian(azimuth, radius) {
	return [Math.cos(azimuth) * radius, -Math.sin(azimuth) * radius]
}

export function gear_path(options = {}) {

	// I can probaly make due with lines and arcs
	let radius = options.radius ?? 40;
	let teeth = options.teeth ?? 18;
	let toothHeight = options.toothHeight ?? 4; // Height of a tooth, defines outer circumference
	let toothWidth = options.toothWidth ?? 6; // Width of a tooth, in inner circumference
	let center = options.center ?? [50, 50];
	let offset = options.offset || 0;
	let ri = radius,
		ro = radius + toothHeight;




	let c = Math.PI * 2 * radius; // Inner circumference
	let c_teeth = teeth * toothWidth;
	let toothRWidth = (Math.PI * 2) / teeth;
	let toothRSpacing = 0;
	// console.log(c_teeth, c);
	if (c_teeth <= c) {
		toothRSpacing = (c - c_teeth) / (teeth);
		// Spacing in circumference ^
		toothRSpacing /= radius;
		toothRWidth -= toothRSpacing;
	}
	let toothRTotal = toothRWidth + toothRSpacing;
	// console.log(toothRWidth, toothRSpacing);

	const polarToCartesianC = (a, r) => {
		return polarToCartesian(a + toothRTotal * offset, r).map((x, i) => x + center[i]).join(" ")
	}

	let path = "M" + polarToCartesianC(0, ri);
	for (let i = 0; i < teeth; i++) {
		// The first point is the ^
		// path += `l${toothWidth/4} -${toothHeight}`;
		// path += `l${toothWidth/2} 0`;
		// path += `l${toothWidth/4} ${toothHeight}`;
		let at = (toothRWidth + toothRSpacing) * i;
		path += `L` + polarToCartesianC(at + toothRWidth / 4, ro);
		path += `L` + polarToCartesianC(at + (toothRWidth / 4) * 3, ro);
		path += `L` + polarToCartesianC(at + (toothRWidth / 4) * 4, ri);
		path += `L` + polarToCartesianC(at + toothRWidth + toothRSpacing, ri);
	}
	path += "z";
	return path;
}