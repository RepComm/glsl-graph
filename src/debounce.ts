
export class Debounce {
  private timeLast: number;
  private timeWait: number;

  constructor (wait: number = 250) {
    this.timeLast = 0;
    this.timeWait = wait;
  }
  update (): boolean {
    let timeNow = Date.now();
    if (timeNow - this.timeLast > this.timeWait) {
      this.timeLast = timeNow;
      return true;
    }
    return false;
  }
}
