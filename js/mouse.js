class Mouse {
  constructor(el) {
    let rect = el.getBoundingClientRect();
    this.x = 0;
    this.y = 0;
    el.onmousemove = e => {
      this.x = e.clientX - rect.left;
      this.y = e.clientY - rect.top;
    };
  }
}
