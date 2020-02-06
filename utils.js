
// # Utils 
// - Some prototypings
// Number prototype of padding two prefix
Number.prototype.padNum = function() {return  this.toString().padStart(2, 0).slice(0, 2) } 
// Check this object is empty
Object.prototype.isEmpty = function() { for (var key in this) { return this.hasOwnProperty(key) ? false : true }}

