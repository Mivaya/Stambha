import { button, buttonRow, selectRow, stringSelect } from "../components/builders.js";
import { ButtonStyle } from "../components/types.js";
import type { ReplyPayload } from "../context/reply.js";
import { sequenceCustomId } from "./customId.js";
import type { SequenceStep } from "./types.js";

/** Render one sequence step as a Discord reply payload (button / select). */
export function renderSequenceStep(sessionId: string, step: SequenceStep): ReplyPayload {
  if (step.type === "button") {
    return {
      content: step.prompt,
      components: [
        buttonRow(
          ...step.buttons.map((b) =>
            button({
              customId: sequenceCustomId(sessionId, step.id, b.id),
              label: b.label,
              style: ButtonStyle.Primary,
            }),
          ),
        ),
      ],
    };
  }

  if (step.type === "select") {
    return {
      content: step.prompt,
      components: [
        selectRow(
          stringSelect({
            customId: sequenceCustomId(sessionId, step.id),
            placeholder: step.placeholder ?? "Choose…",
            options: step.options.map((o) => ({ label: o.label, value: o.value })),
            ...(step.minValues !== undefined ? { minValues: step.minValues } : {}),
            ...(step.maxValues !== undefined ? { maxValues: step.maxValues } : {}),
          }),
        ),
      ],
    };
  }

  return {
    content: `${step.prompt}\n_(Modal steps need a show-modal callback — see Sequences docs.)_`,
  };
}
