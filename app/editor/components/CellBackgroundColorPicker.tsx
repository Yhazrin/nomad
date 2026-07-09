import { useCallback } from "react";
import styled from "styled-components";
import ColorPicker from "@shared/components/ColorPicker";
import { useEditor } from "./EditorContext";

type Props = {
  /** The currently active color */
  activeColor: string;
  command: string;
};

function CellBackgroundColorPicker({ activeColor, command }: Props) {
  const { commands } = useEditor();

  const handleSelect = useCallback(
    (color: string) => {
      if (commands[command]) {
        commands[command]({ color });
      }
    },
    [commands, command]
  );

  return (
    <PickerShell>
      <PickerPanel>
        <ColorPicker alpha activeColor={activeColor} onSelect={handleSelect} />
      </PickerPanel>
    </PickerShell>
  );
}

/* Apple-style container: rounded squircle, layered shadow, glass surface. */
const PickerShell = styled.div`
  padding: 4px;
  border-radius: var(--radius-md);
  background: ${(props) => props.theme.menuBackground};
  box-shadow: var(--shadow-3);
`;

const PickerPanel = styled.div`
  /* Inner padding isolates the picker surface for a subtle inset feel. */
  padding: 4px;
  border-radius: calc(var(--radius-md) - 4px);
`;

export default CellBackgroundColorPicker;
