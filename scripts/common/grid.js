const FIT = 'fit';

// Magic constant for size correction. (WTF)
const CORRECT_SCALE = 1.2;

function parsePx(input) {
	if (!input.endsWith('px')) return null;
	const value = parseInt(input.slice(0,-2));
	if (isNaN(value)) throw(`Could not parse px number "${value}"`);
	return value;
}

class TileGrid {
	/** @type {Panel} */
	element = null;
	rows = 1;
	columns = 1;
	margin = 10;

	/** @type {'down'|'right'} */
	flowChildren = 'right';
	/** @type {'fit'|number} */
	width = FIT;
	/** @type {'fit'|number} */
	height = FIT;

	/** @param {Panel} element */
	constructor(element) {
		this.element = element;
		this.element.style.flowChildren = 'none';

		this.rows = element.GetAttributeInt('rows', 1);
		this.columns = element.GetAttributeInt('columns', 1);
		this.margin = parsePx(element.GetAttributeString('margin', '')) ?? 0;
		this.width = parsePx(element.GetAttributeString('col-width', '')) ?? 'fit';
		this.height = parsePx(element.GetAttributeString('row-height', '')) ?? 'fit';
		this.flowChildren = element.GetAttributeString('flow-children', 'right');

		$.Schedule(0, this.layout.bind(this));
	}

	/** @param { `#${string}` } selector */
	static init(selector) {
		const element = $(selector);
		if (!element) throw(`Could not initialize TileGrid with selector "${selector}"`);
		return new TileGrid(element);
	}

	layout() {
		const calcWidth = (divisions, width) => {
			if (!divisions) return width;
			const margin = this.margin * (divisions - 1);
			const w = (width - margin) / divisions;
			return w;
		}

		if (this.flowChildren === 'right' && !this.columns)
			throw('Column count must be defined for LtR flow!');
		else if (!this.rows)
			throw('Row count must be defined for TtB flow!');

		// These have to be multiplied by a constant???
		// This refuses to work unless I do this. What the fuck?
		const containerWidth = this.element.actuallayoutwidth * CORRECT_SCALE;
		const containerHeight = this.element.actuallayoutheight * CORRECT_SCALE;

		const cMargin = this.margin * CORRECT_SCALE;
		const cWidth = this.width === FIT ? calcWidth(this.columns, containerWidth) : this.width * CORRECT_SCALE;
		const cHeight = this.height === FIT ? calcWidth(this.rows, containerHeight) : this.height * CORRECT_SCALE;
		const cCount = this.element.GetChildCount();

		for ( let i=0; i<cCount; i++ ) {
			/** @type {Panel} */
			const child = this.element.GetChild(i);

			let x, y;
			if (this.flowChildren === 'down') {
				y = i % this.rows;
				x = Math.floor(i / this.rows);
			}
			else {
				x = i % this.columns;
				y = Math.floor(i / this.columns);
			}

			const pX = x * (cWidth + cMargin);
			const pY = y * (cHeight + cMargin);

			child.style.position = `${pX}px ${pY}px 0.0px`;
			child.style.width = `${cWidth}px`;
			child.style.height = `${cHeight}px`;
		}
	}
}
