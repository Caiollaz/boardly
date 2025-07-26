import React from "react";
import { Tool, ToolOptions } from "../types";
import PenIcon from "./icons/PenIcon";
import EraserIcon from "./icons/EraserIcon";
import RectangleIcon from "./icons/RectangleIcon";
import CircleIcon from "./icons/CircleIcon";
import TextIcon from "./icons/TextIcon";
import SelectionIcon from "./icons/SelectionIcon";
import DiagramIcon from "./icons/DiagramIcon";
import LaserPointerIcon from "./icons/LaserPointerIcon";
import HandIcon from "./icons/HandIcon";
import ArrowIcon from "./icons/ArrowIcon";
import LineIcon from "./icons/LineIcon";

const commonButtonClasses =
  "p-2.5 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50";
const activeButtonClasses = "bg-violet-500/90 text-white";
const inactiveButtonClasses = "bg-[#333333] text-gray-300 hover:bg-[#4a4a4a]";

interface ToolButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`${commonButtonClasses} ${
      isActive ? activeButtonClasses : inactiveButtonClasses
    }`}
    aria-label={label}
    title={label}
  >
    {icon}
  </button>
);

interface PropertiesPanelProps {
  tool: Tool;
  options: ToolOptions;
  setOptions: (options: React.SetStateAction<ToolOptions>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  tool,
  options,
  setOptions,
}) => {
  if (
    [Tool.SELECTION, Tool.HAND, Tool.ERASER, Tool.DIAGRAM, Tool.LASER].includes(
      tool
    )
  )
    return null;

  return (
    <div className="bg-[#252525] p-2 rounded-lg shadow-xl flex items-center space-x-4">
      {tool !== Tool.TEXT && (
        <div className="flex items-center space-x-2">
          <label className="text-gray-300 text-xs">Color</label>
          <div
            className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-gray-400"
            style={{ backgroundColor: options.strokeColor }}
          >
            <input
              type="color"
              value={options.strokeColor}
              onChange={(e) =>
                setOptions((o) => ({ ...o, strokeColor: e.target.value }))
              }
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Stroke color"
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <label className="text-gray-300 text-xs">Stroke</label>
        <input
          type="range"
          min="1"
          max="50"
          value={options.strokeWidth}
          onChange={(e) =>
            setOptions((o) => ({ ...o, strokeWidth: Number(e.target.value) }))
          }
          className="w-24"
          aria-label="Stroke width"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-gray-300 text-xs">Opacity</label>
        <input
          type="range"
          min="0"
          max="100"
          value={options.opacity * 100}
          onChange={(e) =>
            setOptions((o) => ({ ...o, opacity: Number(e.target.value) / 100 }))
          }
          className="w-24"
          aria-label="Opacity"
        />
      </div>
    </div>
  );
};

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  options: ToolOptions;
  setOptions: (options: React.SetStateAction<ToolOptions>) => void;
  openDiagramPanel: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  options,
  setOptions,
  openDiagramPanel,
}) => {
  const handleDiagramClick = () => {
    setTool(Tool.DIAGRAM);
    openDiagramPanel();
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-2">
      <div className="p-1.5 bg-[#252525] rounded-lg shadow-xl flex items-center space-x-1.5">
        <ToolButton
          label="Pan"
          icon={<HandIcon className="w-5 h-5" />}
          isActive={tool === Tool.HAND}
          onClick={() => setTool(Tool.HAND)}
        />
        <ToolButton
          label="Select"
          icon={<SelectionIcon className="w-5 h-5" />}
          isActive={tool === Tool.SELECTION}
          onClick={() => setTool(Tool.SELECTION)}
        />
        <ToolButton
          label="Rectangle"
          icon={<RectangleIcon className="w-5 h-5" />}
          isActive={tool === Tool.RECTANGLE}
          onClick={() => setTool(Tool.RECTANGLE)}
        />
        <ToolButton
          label="Circle"
          icon={<CircleIcon className="w-5 h-5" />}
          isActive={tool === Tool.CIRCLE}
          onClick={() => setTool(Tool.CIRCLE)}
        />
        <ToolButton
          label="Arrow"
          icon={<ArrowIcon className="w-5 h-5" />}
          isActive={tool === Tool.ARROW}
          onClick={() => setTool(Tool.ARROW)}
        />
        <ToolButton
          label="Line"
          icon={<LineIcon className="w-5 h-5" />}
          isActive={tool === Tool.LINE}
          onClick={() => setTool(Tool.LINE)}
        />
        <ToolButton
          label="Pen"
          icon={<PenIcon className="w-5 h-5" />}
          isActive={tool === Tool.PEN}
          onClick={() => setTool(Tool.PEN)}
        />
        <ToolButton
          label="Text"
          icon={<TextIcon className="w-5 h-5" />}
          isActive={tool === Tool.TEXT}
          onClick={() => setTool(Tool.TEXT)}
        />
        <ToolButton
          label="Eraser"
          icon={<EraserIcon className="w-5 h-5" />}
          isActive={tool === Tool.ERASER}
          onClick={() => setTool(Tool.ERASER)}
        />
        <div className="w-px h-6 bg-gray-600 mx-1"></div>
        <ToolButton
          label="Diagram from Text"
          icon={<DiagramIcon className="w-5 h-5" />}
          isActive={tool === Tool.DIAGRAM}
          onClick={handleDiagramClick}
        />
        <ToolButton
          label="Laser Pointer"
          icon={<LaserPointerIcon className="w-5 h-5" />}
          isActive={tool === Tool.LASER}
          onClick={() => setTool(Tool.LASER)}
        />
      </div>
      <PropertiesPanel tool={tool} options={options} setOptions={setOptions} />
    </div>
  );
};

export default Toolbar;
