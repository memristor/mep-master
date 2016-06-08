class Quant {
	constructor() {
		this.currentValue = 0;
		this.requestedValue = 0;
		this.treshold = 0;
	}
	
	isReached() {
		if (Math.abs(this.requestedValue - this.currentValue) <= this.treshold) {
			return true;
		}
		return false;
	}
	
	getDiff() {
		return this.requestedValue - this.currentValue;
	}
	
	setRequested(_value) {
		this.requestedValue = _value;
	}
	
	setCurrent(_value) {
		this.currentValue = _value;
	}
}
