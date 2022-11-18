export class Debounce {
  constructor(wait = 250) {
    this.timeLast = 0;
    this.timeWait = wait;
  }
  update() {
    let timeNow = Date.now();
    if (timeNow - this.timeLast > this.timeWait) {
      this.timeLast = timeNow;
      return true;
    }
    return false;
  }
}