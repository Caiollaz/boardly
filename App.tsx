import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import RedoIcon from "./components/icons/RedoIcon";
import TrashIcon from "./components/icons/TrashIcon";
import UndoIcon from "./components/icons/UndoIcon";
import MermaidModal from "./components/MermaidModal";
import Toolbar from "./components/Toolbar";
import {
  ArrowElement,
  CanvasElement,
  ImageElement,
  LineElement,
  PanOffset,
  PenElement,
  Point,
  ShapeElement,
  TextElement,
  Tool,
  ToolOptions,
} from "./types";

// --- Utility Functions ---
const getClientCoords = (
  event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
): Point => {
  if ("touches" in event) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
};

const getCanvasCoords = (
  event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  panOffset: PanOffset
): Point => {
  const client = getClientCoords(event);
  return {
    x: client.x - panOffset.x,
    y: client.y - panOffset.y,
  };
};

const getElementCenter = (element: CanvasElement): Point => {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  };
};

// New utility for point-to-line-segment distance calculation
const distanceToLineSegment = (p: Point, a: Point, b: Point): number => {
  const l2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  if (l2 === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const nearestPoint = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };
  return Math.sqrt((p.x - nearestPoint.x) ** 2 + (p.y - nearestPoint.y) ** 2);
};

const getNormalizedPosition = (element: CanvasElement) => {
  const { x, y, width, height } = element;
  const x1 = width >= 0 ? x : x + width;
  const y1 = height >= 0 ? y : y + height;
  const x2 = width >= 0 ? x + width : x;
  const y2 = height >= 0 ? y + height : y;
  return { x1, y1, x2, y2 };
};

const isPointInsideElement = (
  point: Point,
  element: CanvasElement
): boolean => {
  const { x1, y1, x2, y2 } = getNormalizedPosition(element);
  if (element.tool === Tool.CIRCLE) {
    const center = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2;
    const dist = Math.sqrt(
      (point.x - center.x) ** 2 + (point.y - center.y) ** 2
    );
    return dist <= radius;
  }
  return point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2;
};

const getElementAtPosition = (
  x: number,
  y: number,
  elements: CanvasElement[]
): CanvasElement | null => {
  const point = { x, y };
  // Iterate backwards to select top-most element first
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    switch (element.tool) {
      case Tool.RECTANGLE:
      case Tool.CIRCLE:
      case Tool.TEXT:
      case Tool.DIAGRAM:
        if (isPointInsideElement(point, element)) return element;
        break;
      case Tool.PEN:
        const onStroke = element.points.some((p, index) => {
          if (index === element.points.length - 1) return false;
          const nextP = element.points[index + 1];
          return (
            distanceToLineSegment(point, p, nextP) < element.strokeWidth / 2 + 5
          ); // Tolerance
        });
        if (onStroke) return element;
        break;
      case Tool.LINE:
      case Tool.ARROW:
        const dist = distanceToLineSegment(
          point,
          element.points[0],
          element.points[1]
        );
        if (dist < element.strokeWidth / 2 + 5) {
          // Tolerance
          return element;
        }
        break;
      default:
        break;
    }
  }
  return null;
};

const createElement = (
  id: number,
  x: number,
  y: number,
  tool: Tool,
  options: ToolOptions
): CanvasElement => {
  const { strokeColor, strokeWidth, strokeStyle, opacity, backgroundColor } =
    options;
  const baseElement = {
    id,
    x,
    y,
    width: 0,
    height: 0,
    strokeColor,
    strokeWidth,
    strokeStyle,
    opacity,
  };

  switch (tool) {
    case Tool.RECTANGLE: {
      const element: ShapeElement = {
        ...baseElement,
        tool: Tool.RECTANGLE,
        backgroundColor,
        fillStyle: "solid",
      };
      return element;
    }
    case Tool.CIRCLE: {
      const element: ShapeElement = {
        ...baseElement,
        tool: Tool.CIRCLE,
        backgroundColor,
        fillStyle: "solid",
      };
      return element;
    }
    case Tool.TEXT: {
      const element: TextElement = {
        ...baseElement,
        tool: Tool.TEXT,
        text: "Text",
        fontSize: 24,
        fontFamily: "Inter",
      };
      return element;
    }
    case Tool.LINE: {
      const element: LineElement = {
        ...baseElement,
        tool: Tool.LINE,
        points: [
          { x, y },
          { x, y },
        ],
      };
      return element;
    }
    case Tool.ARROW: {
      const element: ArrowElement = {
        ...baseElement,
        tool: Tool.ARROW,
        points: [
          { x, y },
          { x, y },
        ],
      };
      return element;
    }
    case Tool.PEN:
    default: {
      const element: PenElement = {
        ...baseElement,
        tool: Tool.PEN,
        points: [{ x, y }],
      };
      return element;
    }
  }
};

const drawElement = (
  context: CanvasRenderingContext2D,
  element: CanvasElement
) => {
  context.save();
  context.globalAlpha = element.opacity;
  context.strokeStyle = element.strokeColor;
  context.lineWidth = element.strokeWidth;

  switch (element.tool) {
    case Tool.PEN:
    case Tool.LINE:
      context.beginPath();
      element.points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
      break;
    case Tool.ARROW:
      // This draws a solid, filled arrow as a single polygon
      context.fillStyle = element.strokeColor;

      const [start, end] = element.points;
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      // Use element's strokeWidth for thickness, with a minimum for visibility
      const thickness = element.strokeWidth < 2 ? 2 : element.strokeWidth;

      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      if (length < 10) break; // Don't draw if too small to avoid weird shapes

      // Define proportions for the arrow head
      const arrowHeadLength = Math.min(thickness * 5, length / 2);
      const arrowHeadWidth = thickness * 3;

      // The point where the arrow body ends and the head begins
      const bodyEndPoint = {
        x: end.x - arrowHeadLength * Math.cos(angle),
        y: end.y - arrowHeadLength * Math.sin(angle),
      };

      const angle90 = angle + Math.PI / 2;

      // Calculate all 7 points of the arrow polygon
      const p1 = {
        x: start.x + (thickness / 2) * Math.cos(angle90),
        y: start.y + (thickness / 2) * Math.sin(angle90),
      };
      const p2 = {
        x: start.x - (thickness / 2) * Math.cos(angle90),
        y: start.y - (thickness / 2) * Math.sin(angle90),
      };
      const p3 = {
        x: bodyEndPoint.x - (thickness / 2) * Math.cos(angle90),
        y: bodyEndPoint.y - (thickness / 2) * Math.sin(angle90),
      };
      const p4 = {
        x: bodyEndPoint.x + (thickness / 2) * Math.cos(angle90),
        y: bodyEndPoint.y + (thickness / 2) * Math.sin(angle90),
      };

      const headP1 = end; // The tip of the arrow
      const headP2 = {
        x: bodyEndPoint.x - (arrowHeadWidth / 2) * Math.cos(angle90),
        y: bodyEndPoint.y - (arrowHeadWidth / 2) * Math.sin(angle90),
      };
      const headP3 = {
        x: bodyEndPoint.x + (arrowHeadWidth / 2) * Math.cos(angle90),
        y: bodyEndPoint.y + (arrowHeadWidth / 2) * Math.sin(angle90),
      };

      // Draw the single polygon
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p4.x, p4.y);
      context.lineTo(headP3.x, headP3.y);
      context.lineTo(headP1.x, headP1.y);
      context.lineTo(headP2.x, headP2.y);
      context.lineTo(p3.x, p3.y);
      context.lineTo(p2.x, p2.y);
      context.closePath();
      context.fill();

      // Ensure no stroke is drawn on top of the fill
      context.strokeStyle = "none";
      break;
    case Tool.RECTANGLE:
      context.strokeRect(element.x, element.y, element.width, element.height);
      break;
    case Tool.CIRCLE:
      context.beginPath();
      context.arc(
        element.x + element.width / 2,
        element.y + element.height / 2,
        Math.max(Math.abs(element.width), Math.abs(element.height)) / 2,
        0,
        2 * Math.PI
      );
      context.stroke();
      break;
    case Tool.TEXT:
      context.fillStyle = element.strokeColor;
      context.font = `${element.fontSize}px ${element.fontFamily}`;
      context.textBaseline = "top";
      context.fillText(element.text, element.x, element.y);
      break;
    case Tool.DIAGRAM:
      if (element.image.complete) {
        context.drawImage(
          element.image,
          element.x,
          element.y,
          element.width,
          element.height
        );
      }
      break;
  }
  context.restore();
};

// --- Main App Component ---
const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [action, setAction] = useState<
    "none" | "drawing" | "moving" | "panning" | "writing" | "erasing" | "resizing"
  >("none");
  const [tool, setTool] = useState<Tool>(Tool.HAND);
  const [options, setOptions] = useState<ToolOptions>({
    strokeColor: "#ffffff",
    backgroundColor: "#ffffff",
    strokeWidth: 4,
    strokeStyle: "solid",
    opacity: 1,
  });
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(
    null
  );
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [startPanPoint, setStartPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [movingOffset, setMovingOffset] = useState<Point>({ x: 0, y: 0 });
  const [hasStarted, setHasStarted] = useState(false);
  const [isNewTextElement, setIsNewTextElement] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  // Adicionar estado para texto temporário ao editar
  const [editingText, setEditingText] = useState<string>("");

  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isMermaidPanelOpen, setIsMermaidPanelOpen] = useState(false);

  const [laserTrail, setLaserTrail] = useState<Point[]>([]);

  useEffect(() => {
    // @ts-ignore
    if (window.mermaid) {
      // @ts-ignore
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        darkMode: true,
        themeVariables: {
          background: "#1e1e1e",
          primaryColor: "#2D2D2D",
          primaryTextColor: "#fff",
          lineColor: "#aaa",
          secondaryColor: "#3a3a3a",
          tertiaryColor: "#252525",
        },
      });
    }
  }, []);

  // Função utilitária para obter as posições dos handles
  const getResizeHandles = (element: CanvasElement) => {
    const { x1, y1, x2, y2 } = getNormalizedPosition(element);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return [
      { x: x1, y: y1, position: "nw" }, // canto superior esquerdo
      { x: midX, y: y1, position: "n" }, // meio superior
      { x: x2, y: y1, position: "ne" }, // canto superior direito
      { x: x2, y: midY, position: "e" }, // meio direito
      { x: x2, y: y2, position: "se" }, // canto inferior direito
      { x: midX, y: y2, position: "s" }, // meio inferior
      { x: x1, y: y2, position: "sw" }, // canto inferior esquerdo
      { x: x1, y: midY, position: "w" }, // meio esquerdo
    ];
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(panOffset.x, panOffset.y);

    elements.forEach((element) => {
      // Draw selection highlight for the selected element
      if (
        selectedElement &&
        selectedElement.id === element.id &&
        action !== "writing"
      ) {
        const { x1, y1, x2, y2 } = getNormalizedPosition(element);
        context.save();
        context.strokeStyle = "rgba(0, 122, 255, 0.8)"; // A distinct blue color
        context.lineWidth = 1.5;
        context.setLineDash([5, 5]); // Dashed line style
        context.strokeRect(x1 - 4, y1 - 4, x2 - x1 + 8, y2 - y1 + 8);
        context.restore();

        // Desenhar handles de redimensionamento
        const handles = getResizeHandles(element);
        handles.forEach((handle) => {
          context.save();
          context.beginPath();
          context.arc(handle.x, handle.y, 6, 0, 2 * Math.PI);
          context.fillStyle = "#fff";
          context.strokeStyle = "#7c3aed";
          context.lineWidth = 2;
          context.fill();
          context.stroke();
          context.restore();
        });
      }
      // Não desenhar o texto do elemento enquanto estiver editando
      if (!(action === "writing" && selectedElement && selectedElement.id === element.id && element.tool === Tool.TEXT)) {
        drawElement(context, element);
      }
    });

    context.restore();

    // Draw laser pointer on top, without panning
    if (laserTrail.length > 0) {
      laserTrail.forEach((point, index) => {
        const opacity = ((index + 1) / laserTrail.length) * 0.8;
        context.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        context.beginPath();
        context.arc(
          point.x,
          point.y,
          (8 * (index + 1)) / laserTrail.length,
          0,
          2 * Math.PI
        );
        context.fill();
      });
    }
  }, [elements, panOffset, laserTrail, selectedElement, action]);

  useEffect(() => {
    if (action === "writing" && textAreaRef.current) {
      // Atualizar texto temporário ao iniciar edição
      setEditingText(selectedElement?.tool === Tool.TEXT ? selectedElement.text : "");
      // Foco e seleção
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          if (isNewTextElement) {
            textAreaRef.current.select();
            setIsNewTextElement(false);
          }
        }
      }, 0);
    }
  }, [action, isNewTextElement, selectedElement]);

  // Atualizar texto em tempo real
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setEditingText(newText);
    if (!selectedElement) return;
    setElements((prev) => {
      const elementsCopy = [...prev];
      const index = elementsCopy.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        const elementToUpdate = elementsCopy[index];
        if (elementToUpdate.tool === Tool.TEXT) {
          elementsCopy[index] = {
            ...elementToUpdate,
            text: newText,
          };
        }
      }
      return elementsCopy;
    });
  };

  const updateHistory = useCallback(
    (newElements: CanvasElement[]) => {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setElements(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setElements([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([]);
    setHistoryIndex(-1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (action === "writing") return;
    setHasStarted(true);
    const canvasCoords = getCanvasCoords(event.nativeEvent, panOffset);

    // --- Detectar clique em handle de redimensionamento ---
    if (tool === Tool.SELECTION && selectedElement) {
      const handles = getResizeHandles(selectedElement);
      for (const handle of handles) {
        const dx = canvasCoords.x - handle.x;
        const dy = canvasCoords.y - handle.y;
        if (Math.sqrt(dx * dx + dy * dy) < 10) { // 10px de tolerância
          setResizeHandle(handle.position);
          setAction("resizing");
          return;
        }
      }
    }
    // --- Fim da detecção de handle ---

    if (tool === Tool.HAND) {
      setAction("panning");
      setStartPanPoint(getClientCoords(event.nativeEvent));
    } else if (tool === Tool.SELECTION) {
      const element = getElementAtPosition(
        canvasCoords.x,
        canvasCoords.y,
        elements
      );
      setSelectedElement(element);
      if (element) {
        setAction("moving");
        setMovingOffset({
          x: canvasCoords.x - element.x,
          y: canvasCoords.y - element.y,
        });
        // Bring selected element to front
        setElements((prev) => [
          ...prev.filter((el) => el.id !== element.id),
          element,
        ]);
      }
    } else if (tool === Tool.ERASER) {
      setAction("erasing");
    } else if (tool === Tool.LASER) {
      setLaserTrail([getClientCoords(event.nativeEvent)]);
    } else {
      const id = Date.now();
      const newElement = createElement(
        id,
        canvasCoords.x,
        canvasCoords.y,
        tool,
        options
      );
      if (newElement.tool === Tool.ARROW) {
        const startBinding = getElementAtPosition(
          canvasCoords.x,
          canvasCoords.y,
          elements
        );
        if (startBinding)
          (newElement as ArrowElement).startBinding = startBinding.id;
      }
      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement);
      setAction("drawing");
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const clientCoords = getClientCoords(event.nativeEvent);
    const canvasCoords = getCanvasCoords(event.nativeEvent, panOffset);

    if (tool === Tool.HAND) (event.target as HTMLElement).style.cursor = "grab";
    else if (tool === Tool.SELECTION)
      (event.target as HTMLElement).style.cursor = getElementAtPosition(
        canvasCoords.x,
        canvasCoords.y,
        elements
      )
        ? "move"
        : "default";
    else if (tool === Tool.LASER)
      (event.target as HTMLElement).style.cursor = "none";
    else (event.target as HTMLElement).style.cursor = "crosshair";

    if (action === "resizing" && selectedElement && resizeHandle) {
      // Redimensionar elemento conforme handle
      setElements((prevElements) => {
        const index = prevElements.findIndex((el) => el.id === selectedElement.id);
        if (index === -1) return prevElements;
        const el = { ...prevElements[index] };
        const { x1, y1, x2, y2 } = getNormalizedPosition(el);
        let newX1 = x1, newY1 = y1, newX2 = x2, newY2 = y2;
        switch (resizeHandle) {
          case "nw": newX1 = canvasCoords.x; newY1 = canvasCoords.y; break;
          case "n":  newY1 = canvasCoords.y; break;
          case "ne": newX2 = canvasCoords.x; newY1 = canvasCoords.y; break;
          case "e":  newX2 = canvasCoords.x; break;
          case "se": newX2 = canvasCoords.x; newY2 = canvasCoords.y; break;
          case "s":  newY2 = canvasCoords.y; break;
          case "sw": newX1 = canvasCoords.x; newY2 = canvasCoords.y; break;
          case "w":  newX1 = canvasCoords.x; break;
        }
        // Atualizar x, y, width, height baseado nos novos cantos
        el.x = Math.min(newX1, newX2);
        el.y = Math.min(newY1, newY2);
        el.width = Math.abs(newX2 - newX1);
        el.height = Math.abs(newY2 - newY1);
        prevElements = [...prevElements];
        prevElements[index] = el;
        return prevElements;
      });
      return;
    }

    if (action === "panning") {
      const dx = clientCoords.x - startPanPoint.x;
      const dy = clientCoords.y - startPanPoint.y;
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPanPoint(clientCoords);
    } else if (action === "drawing" && selectedElement) {
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index === -1) return;

      const elementsCopy = [...elements];
      const currentElement = { ...elementsCopy[index] };

      switch (currentElement.tool) {
        case Tool.PEN:
          (currentElement as PenElement).points.push(canvasCoords);
          break;
        case Tool.RECTANGLE:
        case Tool.CIRCLE:
        case Tool.TEXT: // Allow dragging to define text box size
          currentElement.width = canvasCoords.x - currentElement.x;
          currentElement.height = canvasCoords.y - currentElement.y;
          break;
        case Tool.LINE:
        case Tool.ARROW:
          (currentElement as LineElement | ArrowElement).points[1] =
            canvasCoords;
          break;
      }
      elementsCopy[index] = currentElement;
      setElements(elementsCopy);
    } else if (action === "moving" && selectedElement) {
      const newX = canvasCoords.x - movingOffset.x;
      const newY = canvasCoords.y - movingOffset.y;

      setElements((prevElements) => {
        const elementsCopy = [...prevElements];
        const index = elementsCopy.findIndex(
          (el) => el.id === selectedElement.id
        );
        if (index === -1) return prevElements;

        const originalElement = elementsCopy[index];
        const dx = newX - originalElement.x;
        const dy = newY - originalElement.y;

        let updatedElement = { ...originalElement, x: newX, y: newY };
        if (updatedElement.tool === Tool.PEN) {
          updatedElement.points = updatedElement.points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
        }
        elementsCopy[index] = updatedElement;

        return elementsCopy.map((el) => {
          if (el.tool === Tool.ARROW) {
            let newArrow = { ...el };
            let updated = false;
            if (newArrow.startBinding === updatedElement.id) {
              newArrow.points = [
                getElementCenter(updatedElement),
                newArrow.points[1],
              ];
              updated = true;
            }
            if (newArrow.endBinding === updatedElement.id) {
              newArrow.points = [
                newArrow.points[0],
                getElementCenter(updatedElement),
              ];
              updated = true;
            }
            return updated ? newArrow : el;
          }
          return el;
        });
      });
    } else if (action === "erasing") {
      const elementToErase = getElementAtPosition(
        canvasCoords.x,
        canvasCoords.y,
        elements
      );
      if (elementToErase) {
        setElements((prev) => prev.filter((el) => el.id !== elementToErase.id));
      }
    } else if (tool === Tool.LASER && laserTrail.length > 0) {
      setLaserTrail((prev) => [...prev.slice(-20), clientCoords]);
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    const canvasCoords = getCanvasCoords(event.nativeEvent, panOffset);
    if (selectedElement && action === "drawing") {
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        const elementsCopy = [...elements];
        const currentElement = { ...elementsCopy[index] };

        if (currentElement.tool === Tool.ARROW) {
          const endBinding = getElementAtPosition(
            canvasCoords.x,
            canvasCoords.y,
            elements
          );
          if (endBinding) {
            (currentElement as ArrowElement).endBinding = endBinding.id;
            elementsCopy[index] = currentElement;
            setElements(elementsCopy);
          }
        }
        if (currentElement.tool === Tool.TEXT) {
          const { x1, y1, x2, y2 } = getNormalizedPosition(currentElement);
          // If user just clicks, give text area a default size
          if (x2 - x1 < 20 && y2 - y1 < 20) {
            currentElement.width = 150;
            currentElement.height = 40; // Enough for one line of text
            elementsCopy[index] = currentElement;
            setElements(elementsCopy);
          }
          setAction("writing");
          setIsNewTextElement(true);
          return; // Don't reset state yet, user is writing
        }
      }
    }

    if (action === "drawing" || action === "moving" || action === "erasing" || action === "resizing") {
      updateHistory(elements);
    }

    if (action !== "writing") {
      setAction("none");
      setResizeHandle(null);
      if (tool !== Tool.SELECTION) {
        setSelectedElement(null);
      }
    }

    setLaserTrail([]);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    const canvasCoords = getCanvasCoords(event.nativeEvent, panOffset);
    const element = getElementAtPosition(
      canvasCoords.x,
      canvasCoords.y,
      elements
    );
    if (element && element.tool === Tool.TEXT) {
      setAction("writing");
      setSelectedElement(element);
    }
  };

  const handleMouseLeave = () => {
    if (tool === Tool.LASER) {
      setLaserTrail([]);
    }
    if (action === "drawing" || action === "moving" || action === "erasing") {
      if (elements.length > (history[historyIndex]?.length ?? 0)) {
        updateHistory(elements);
      }
      setAction("none");
      setSelectedElement(null);
    }
  };

  const handleTextBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!selectedElement) return;

    const newText = event.target.value;

    // If text is empty, remove the element
    if (newText.trim() === "") {
      const newElements = elements.filter((el) => el.id !== selectedElement.id);
      setElements(newElements);
      updateHistory(newElements);
    } else {
      const elementsCopy = [...elements];
      const index = elementsCopy.findIndex(
        (el) => el.id === selectedElement.id
      );
      if (index !== -1) {
        const elementToUpdate = elementsCopy[index];
        if (elementToUpdate.tool === Tool.TEXT) {
          const textWidth =
            textAreaRef.current?.scrollWidth || elementToUpdate.width;
          const textHeight =
            textAreaRef.current?.scrollHeight || elementToUpdate.height;

          elementsCopy[index] = {
            ...elementToUpdate,
            text: newText,
            width: textWidth,
            height: textHeight,
          };
          setElements(elementsCopy);
          updateHistory(elementsCopy);
        }
      }
    }

    setAction("none");
    setSelectedElement(null);
  };

  const handleAddDiagram = (svgDataUrl: string) => {
    const image = new Image();
    image.src = svgDataUrl;
    image.onload = () => {
      const id = Date.now();
      const aspectRatio = image.width / image.height;
      const newImageElement: ImageElement = {
        id,
        tool: Tool.DIAGRAM,
        x: 100 - panOffset.x,
        y: 100 - panOffset.y,
        width: 400,
        height: 400 / aspectRatio,
        base64: svgDataUrl,
        image,
        strokeColor: "",
        strokeWidth: 0,
        strokeStyle: "solid",
        opacity: 1,
      };
      const newElements = [...elements, newImageElement];
      setElements(newElements);
      updateHistory(newElements);
      setIsMermaidPanelOpen(false);
    };
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.fillStyle = "#1e1e1e";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.translate(panOffset.x, panOffset.y);
    elements.forEach((el) => drawElement(tempCtx, el));

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = tempCanvas.toDataURL("image/png", 1.0);
    link.click();
  };

  return (
    <div className="w-full h-full relative font-sans text-white overflow-hidden">
      <Toolbar
        tool={tool}
        setTool={setTool}
        options={options}
        setOptions={setOptions}
        openDiagramPanel={() => setIsMermaidPanelOpen(true)}
      />

      <MermaidModal
        isOpen={isMermaidPanelOpen}
        onClose={() => setIsMermaidPanelOpen(false)}
        onInsert={handleAddDiagram}
      />

      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={exportCanvas}
          className="bg-[#2D2D2D] text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#3a3a3a] transition-colors"
        >
          Compartilhar
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-2">
        <div className="flex items-center bg-[#252525] p-1 rounded-lg shadow-xl">
          <button
            onClick={undo}
            disabled={historyIndex < 0}
            className="p-2 text-gray-300 hover:bg-[#3a3a3a] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UndoIcon className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-gray-300 hover:bg-[#3a3a3a] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RedoIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1"></div>
          <button
            onClick={clearCanvas}
            className="p-2 text-red-400 hover:bg-red-900/50 rounded-md"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!hasStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none z-0">
          <div className="flex flex-col items-center p-8 rounded-2xl">
            <svg
              className="w-16 h-16 text-violet-400 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-100 mb-2">
              Boardly
            </h1>
            <p className="text-lg md:text-xl text-gray-400">
              Desenhe, crie e colabore. Todos os dados são salvos localmente.
            </p>
          </div>
        </div>
      )}

      {action === "writing" &&
        selectedElement &&
        selectedElement.tool === Tool.TEXT && (
          <textarea
            ref={textAreaRef}
            onBlur={handleTextBlur}
            style={{
              position: "absolute",
              top: getNormalizedPosition(selectedElement).y1 + panOffset.y,
              left: getNormalizedPosition(selectedElement).x1 + panOffset.x,
              minWidth: 40,
              minHeight: 24,
              width:
                getNormalizedPosition(selectedElement).x2 -
                getNormalizedPosition(selectedElement).x1,
              height:
                getNormalizedPosition(selectedElement).y2 -
                getNormalizedPosition(selectedElement).y1,
              font: `${selectedElement.fontSize}px ${selectedElement.fontFamily}`,
              color: selectedElement.strokeColor,
              background: "transparent",
              border: "1px solid #007aff",
              outline: "none",
              resize: "none",
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              zIndex: 20,
              caretColor: selectedElement.strokeColor,
            }}
            value={editingText}
            onChange={handleTextChange}
            rows={1}
            spellCheck={false}
            autoFocus
            onInput={e => {
              // Auto-resize
              const ta = e.currentTarget;
              ta.style.height = 'auto';
              ta.style.height = ta.scrollHeight + 'px';
              ta.style.width = 'auto';
              ta.style.width = ta.scrollWidth + 'px';
            }}
          />
        )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full bg-[#1e1e1e]"
      />
    </div>
  );
};

export default App;
