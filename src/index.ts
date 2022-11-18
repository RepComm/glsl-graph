
import { exponent, UIBuilder } from "@roguecircuitry/htmless";
import { renderer } from "./renderer.js";
import { styles } from "./styles.js";

async function main () {
  
  //create an interface builder
  let ui = new UIBuilder();

  //styling
  styles(ui); ui.mount(document.head);

  //apply flexbox to everything..
  ui.default(exponent);

  //create a div container
  ui.create("div").id("container").mount(document.body);
  let container = ui.e;

  //create a canvas
  renderer(ui);
  ui.mount(container);

}

main();
