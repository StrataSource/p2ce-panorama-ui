'use strict';

// Magic constant for size correction. (WTF)
const CORRECT_SCALE = 1.2;

// "fit" constant
const FIT = 'fit';

/** @param {string} input */
function parsePx(input) {
	if (!input.endsWith('px')) return null;
	const value = parseInt(input.slice(0,-2));
	if (isNaN(value)) return null;
	return value;
}

class TileGrid {
	/** @type {Panel} */
	element = null;
	rows = 1;
	columns = 1;
	margin = 10;

	/** @type {WeakMap<Panel, {x: number, y: number, w: number, h: number}>} */
	childMap = new WeakMap();

	/** @type {'down'|'right'} */
	flowChildren = 'right';
	/** @type {number|FIT} */
	width = FIT;
	/** @type {number|FIT} */
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

	/**
	 * Calculates the layout for this grid and stores it for rendering.
	 * @todo This algorithm is **NOT EFFICIENT IN THE SLIGHTEST.** You have been warned.
	 */
	layout() {
		const startTimestamp = Date.now();
		const childCount = this.element.GetChildCount();
		this.childMap = new WeakMap();

		/** @type {{[key: string]: true}} */
		const tileMap = {};
		const consumeSpace  = (x, y, w, h) => {
			for ( let _y=0;  _y<h; _y++ ) {
				for ( let _x=0; _x<w; _x++ ) {
					tileMap[(x+_x)+':'+(y+_y)] = true;
				}
			}
			return false;
		}
		const checkSpace  = (x, y, w, h) => {
			for ( let _y=0; _y<h; _y++ ) {
				for ( let _x=0; _x<w; _x++ ) {
					if (tileMap[(x+_x)+':'+(y+_y)]) return true;
				}
			}
			return false;
		}

		// Abstract x/y to n/m, where n is always the slower axis.
		const isVertical = this.flowChildren === 'down';
		const max_m = isVertical ? this.rows : this.columns;
		let min_n = 0; // Tetris optimization: Mark the last filled line as the starting point.

		// Time to morb
		for ( let i=0; i<childCount; i++ ) {
			/** @type {Panel} */
			const child = this.element.GetChild(i);
			const width = child.GetAttributeInt('w', 1);
			const height = child.GetAttributeInt('h', 1);
			const entry = { w: width, h: height };

			let n = min_n, m = 0;
			let x, y;
			while (true) {
				x = isVertical ? n : m;
				y = isVertical ? m : n;
				if (!checkSpace(x, y, width, height)) { break }

				m += 1;
				if (m >= max_m) {
					n += 1, m = 0;
					if (width === 1 && height === 1) min_n = n - 1;
				}
			}

			entry.x = x;
			entry.y = y;
			this.childMap.set(child, entry);
			consumeSpace(x, y, width, height);
		}

		const endTimestamp = Date.now();
		$.Msg(`Completed layout operation in ${endTimestamp-startTimestamp}ms`);
		this.render();
	}

	render() {
		const calcSize = (divisions, width) => {
			if (!divisions) return width;
			const margin = this.margin * (divisions - 1);
			return (width - margin) / divisions;
		}

		const calcChildSize = (width, unit) => {
			return unit * width + (this.margin * (width - 1));
		}

		const containerWidth = this.element.actuallayoutwidth;
		const containerHeight = this.element.actuallayoutheight;
		const unitWidth = this.width === FIT ? calcSize(this.columns, containerWidth) : this.width;
		const unitHeight = this.height === FIT ? calcSize(this.rows, containerHeight) : this.height;

		const childCount = this.element.GetChildCount();
		for ( let i=0; i<childCount; i++ ) {

			/** @type {Panel} */
			const child = this.element.GetChild(i);
			const info = this.childMap.get(child);

			// These have to be multiplied by a constant (???)
			const cx = CORRECT_SCALE * (unitWidth + this.margin) * info.x;
			const cy = CORRECT_SCALE * (unitHeight + this.margin) * info.y;
			const cw = CORRECT_SCALE * calcChildSize(info.w, unitWidth);
			const ch = CORRECT_SCALE * calcChildSize(info.h, unitHeight);

			child.style.position = `${cx}px ${cy}px 0.0px`;
			child.style.width = `${cw}px`;
			child.style.height = `${ch}px`;
		}
	}
}

const panel = $.GetContextPanel();
$.Schedule(0, () => {
	const grid = new TileGrid(panel);
	panel.SetPanelEvent('DoLayout', () => grid.layout());
	panel.SetPanelEvent('DoRender', () => grid.render());
});