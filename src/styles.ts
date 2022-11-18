import { UIBuilder } from "@roguecircuitry/htmless";

export function styles (ui: UIBuilder): HTMLStyleElement {
  ui.create("style")
  .style({
    "body": {
      backgroundColor: "#121212"
    },
    "#canvas": {

    }
  });
  return ui.e as HTMLStyleElement;
}
