
import { GameInput } from "@repcomm/gameinput-ts";
import { Object2D, Vec2 } from "@repcomm/scenario2d";
import { UIBuilder } from "@roguecircuitry/htmless";
import { aabb } from "./aabb.js";
import { Debounce } from "./debounce.js";
import { Connection, Node } from "./nodes/node.js";

export interface Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nodes: Set<Node>;
  scene: Object2D;
}

export interface ModeConfig {
  id: string;
  onUpdate?(): void;
  onStart?(previousMode?: string): void;
  onEnd?(nextMode?: string): void;
  onRender?(ctx: CanvasRenderingContext2D): void;
}

export class ModeHandler {
  currentMode: ModeConfig;
  modes: Map<string, ModeConfig>;

  constructor() {
    this.modes = new Map();
  }
  add(modeConfig: ModeConfig): this {
    if (this.modes.size < 1) this.currentMode = modeConfig;
    this.modes.set(modeConfig.id, modeConfig);
    return this;
  }
  update() {
    if (this.currentMode && this.currentMode.onUpdate) this.currentMode.onUpdate();
  }
  find(id: string): ModeConfig {
    for (let [idm, mode] of this.modes) {
      if (id === idm) return mode;
    }
  }
  switch(id: string, cancel: boolean = false): this {
    let previousMode = this.currentMode;
    this.currentMode = null;
    let nextMode = this.find(id);

    if (previousMode && previousMode.onEnd && !cancel) previousMode.onEnd(nextMode.id);
    this.currentMode = nextMode;
    if (nextMode && nextMode.onStart) nextMode.onStart(previousMode.id);
    return this;
  }
  render(ctx: CanvasRenderingContext2D): this {
    if (this.currentMode && this.currentMode.onRender) {
      ctx.save();
      this.currentMode.onRender(ctx);
      ctx.restore();
    }
    return this;
  }
}

export function Vec2MinMax(min: Vec2, max: Vec2) {
  let minx = Math.min(min.x, max.x);
  let miny = Math.min(min.y, max.y);
  let maxx = Math.max(min.x, max.x);
  let maxy = Math.max(min.y, max.y);
  min.set(minx, miny);
  max.set(maxx, maxy);
}

export function renderer(ui: UIBuilder): Renderer {

  let canvas = ui.create("canvas").id("canvas").e as HTMLCanvasElement;

  //get a 2d context from it
  let ctx = canvas.getContext("2d");

  //create a scene root object
  let scene = new Object2D();

  let nodes = new Set<Node>();
  let nodeConnections = new Set<Connection>();

  function addNode(n: Node) {
    nodes.add(n);
    scene.add(n);
  }
  function removeNode(n: Node) {
    nodes.delete(n);
    scene.remove(n);
  }
  function createNode() {
    let result = new Node();

    addNode(result);

    return result;
  }
  function addConnection(c: Connection) {
    nodeConnections.add(c);
    scene.add(c);
  }
  function removeConnection(c: Connection) {
    nodeConnections.delete(c);
    scene.remove(c);
  }
  function createNodeConnection(input: Node) {
    console.log("creating node connection");
    let result = new Connection();
    result.setNode(input, input.getRandomPort("input"), "input");

    addConnection(result);

    return result;
  }

  let mousePos = new Vec2();

  function getNode (p: Vec2) {
    for (let node of nodes) {
      if (node.containsPoint(p)) {
        return node;
      }
    }
  }

  function selectNodes(p: Vec2, deselectNonContacts: boolean = true) {
    let oneNodeSelected = false;

    for (let node of nodes) {
      if (node.containsPoint(p)) {
        if (oneNodeSelected && deselectNonContacts) {
          continue;
        }

        node.isSelected = !node.isSelected;
        oneNodeSelected = true;
      } else if (deselectNonContacts) {
        node.isSelected = false;
      }
    }
  }

  let input = GameInput.get();
  input.addJsonConfig({
    name: "renderer-nodes-input",
    buttons: [
      {
        id: "grab-node",
        influences: [{
          keys: ["g"]
        }]
      }, {
        id: "create-node",
        influences: [{
          keys: [" "]
        }]
      }, {
        id: "box-select",
        influences: [{
          keys: ["b"]
        }]
      }, {
        id: "delete-node",
        influences: [{
          keys: ["x"],
        }]
      }, {
        id: "connect",
        influences: [{
          keys: ["c"]
        }]
      }
    ],
    axes: [{
      id: "move-x",
      influences: [{
        value: 1,
        mouseAxes: [0]
      }]
    }, {
      id: "move-y",
      influences: [{
        value: 1,
        mouseAxes: [1]
      }]
    }]
  });

  ui.on("mousemove", (evt) => {
    mousePos.set(evt.clientX, evt.clientY);
  });

  let grabDebounce = new Debounce();
  let createDebounce = new Debounce(200);
  let deleteDebounce = new Debounce(200);
  let connectDebounce = new Debounce(200);
  let boxDebounce = new Debounce(100);

  let moveVector = new Vec2();

  let boxStart = new Vec2();
  let boxEnd = new Vec2();
  let boxSize = new Vec2();

  let currentNodeConnection: Connection;

  function getFirstNode() {
    for (let node of nodes) {
      return node;
    }
  }
  function getLastNode() {
    let result: Node;
    for (let node of nodes) {
      result = node;
    }
    return result;
  }

  let modeHandler = new ModeHandler();
  modeHandler.add({
    id: "grabbing",
    onStart() {
      moveVector.set(0, 0);
      canvas.style.cursor = "move";
    },
    onEnd() {
      moveVector.set(0, 0);
      canvas.style.cursor = "default";
    },
    onUpdate() {
      for (let node of nodes) {
        if (node.isSelected) {
          node.localTransform.position.add(moveVector);
        }
      }
      moveVector.set(0, 0);
    }
  });
  modeHandler.add({
    id: "box-selecting",
    onStart() {
      boxStart.copy(mousePos);
    },
    onUpdate() {
      boxEnd.copy(mousePos);
    },
    onEnd() {
      boxEnd.copy(mousePos);

      Vec2MinMax(boxStart, boxEnd);
      boxSize.copy(boxEnd).sub(boxStart);

      for (let node of nodes) {
        // if (node.globalTransform.position.x)
        if (aabb(boxStart, boxSize, node.globalTransform.position, node.size)) {
          node.isSelected = true;
        }
      }
    },
    onRender(ctx) {
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        boxStart.x, boxStart.y,
        boxEnd.x - boxStart.x, boxEnd.y - boxStart.y
      );
    }
  });
  modeHandler.add({
    id: "idle"
  });
  modeHandler.add({
    id: "connect",
    onStart() {
      let start = getNode(mousePos);
      if (!start) {
        modeHandler.switch("idle", true);
        return;
      }

      currentNodeConnection = createNodeConnection(start);

    },
    onUpdate() {
      currentNodeConnection.floatingEndpoint.copy(mousePos);
    },
    onEnd() {
      let end = getNode(mousePos);
      if (!end) {
        removeConnection(currentNodeConnection);
        currentNodeConnection = null;
        return;
      }

      currentNodeConnection.setNode(end, end.getRandomPort("output"), "output");
    }
  })

  let updatesPerSecond = 15;
  setInterval(() => {
    modeHandler.update();

    if (input.getButtonValue("grab-node") && grabDebounce.update()) modeHandler.switch("grabbing");


    if (modeHandler.currentMode.id === "idle") {
      if (input.getButtonValue("create-node") && createDebounce.update()) {
        createNode().localTransform.position.copy(mousePos);
      } else if (input.getButtonValue("delete-node") && deleteDebounce.update()) {
        let toDelete = new Set<Node>();
        for (let node of nodes) {
          toDelete.add(node);
        }
        for (let node of toDelete) {
          removeNode(node);
        }
      }
    }

    if (input.getButtonValue("box-select") && boxDebounce.update()) modeHandler.switch("box-selecting");

    if (input.getButtonValue("connect") && connectDebounce.update()) modeHandler.switch("connect");

  }, 1000 / updatesPerSecond);

  ui.on("click", (evt) => {
    if (modeHandler.currentMode.id === "idle") {
      selectNodes(mousePos, !evt.shiftKey);
    } else {
      modeHandler.switch("idle");
    }
  });

  //create a callback for requestAnimationFrame
  let render = () => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //tell the scene to render (includes children)
    scene.render(ctx);

    modeHandler.render(ctx);

    //schedule the next frame
    requestAnimationFrame(render);

    moveVector.x += input.getAxisValue("move-x");
    moveVector.y += input.getAxisValue("move-y");
  };
  //schedule the first frame
  requestAnimationFrame(render);

  let handleResize = () => {
    let r = ui.ref(canvas).getRect();
    canvas.width = r.width;
    canvas.height = r.height;
  };

  setTimeout(handleResize, 250);
  ui.ref(window as any).on("resize", handleResize);

  ui.ref(canvas);

  return {
    canvas,
    ctx,
    nodes,
    scene
  };
}
