import { describe, expect, it } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import { Signal } from "../registries/Signal.js";
import {
  actionRow,
  button,
  buttonRow,
  ButtonStyle,
  ComponentType,
  confirmCancelRow,
  modal,
  registerPersistentSignals,
  selectRow,
  stringSelect,
  textInput,
  TextInputStyle,
} from "./index.js";

describe("component builders", () => {
  it("builds button rows and confirm/cancel", () => {
    const client = new StambhaClient();
    const signal = new (class extends Signal {
      run = async () => {};
    })(client.registries.signals, { name: "confirm" });

    const row = confirmCancelRow(signal);
    expect(row.type).toBe(ComponentType.ActionRow);
    expect(row.components).toHaveLength(2);
    expect(row.components[0]).toMatchObject({
      type: ComponentType.Button,
      style: ButtonStyle.Success,
      custom_id: "stambha:confirm:yes",
      label: "Confirm",
    });
    expect(row.components[1]).toMatchObject({
      custom_id: "stambha:confirm:no",
      style: ButtonStyle.Secondary,
    });
  });

  it("builds string select rows", () => {
    const row = selectRow(
      stringSelect({
        customId: "stambha:colors",
        placeholder: "Pick",
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ],
      }),
    );
    expect(row.components[0]).toMatchObject({
      type: ComponentType.StringSelect,
      custom_id: "stambha:colors",
      placeholder: "Pick",
    });
  });

  it("builds modals with text inputs", () => {
    const m = modal({
      customId: "stambha:note",
      title: "Note",
      components: [actionRow(textInput({ customId: "body", label: "Body", style: TextInputStyle.Paragraph }))],
    });
    expect(m.custom_id).toBe("stambha:note");
    expect(m.components[0]?.components[0]).toMatchObject({
      type: ComponentType.TextInput,
      custom_id: "body",
    });
  });

  it("rejects invalid row layouts", () => {
    expect(() => buttonRow()).toThrow(/1–5/);
    expect(() =>
      actionRow(
        button({ customId: "a", label: "A" }),
        stringSelect({ customId: "s", options: [{ label: "x", value: "x" }] }),
      ),
    ).toThrow(/alone/);
  });
});

describe("registerPersistentSignals", () => {
  it("registers new signals and skips existing names", () => {
    const client = new StambhaClient();
    class PanelSignal extends Signal {
      run = async () => {};
    }

    const first = registerPersistentSignals(client, (registry) => [
      new PanelSignal(registry, { name: "panel", types: ["button"] }),
    ]);
    expect(first).toHaveLength(1);
    expect(client.registries.signals.get("panel")).toBe(first[0]);

    const second = registerPersistentSignals(client, (registry) => [
      new PanelSignal(registry, { name: "panel", types: ["button"] }),
      new PanelSignal(registry, { name: "panel-b", types: ["select"] }),
    ]);
    expect(second.map((s) => s.name)).toEqual(["panel-b"]);
    expect(client.registries.signals.size).toBe(2);
  });
});
