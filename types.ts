import { GoogleGenAI } from "@google/genai";

export enum Tool {
  SELECTION = "SELECTION",
  HAND = "HAND",
  PEN = "PEN",
  RECTANGLE = "RECTANGLE",
  CIRCLE = "CIRCLE",
  ARROW = "ARROW",
  LINE = "LINE",
  TEXT = "TEXT",
  ERASER = "ERASER",
  DIAGRAM = "DIAGRAM",
  LASER = "LASER",
}

export type Point = { x: number; y: number };
export type PanOffset = { x: number; y: number };

export type StrokeStyle = "solid" | "dashed" | "dotted";

// Base element type
interface BaseElement {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  tool: Tool;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  seed?: number; // Para roughjs
  roughness?: number; // Para personalização
}

// Element for Pen/Brush strokes
export interface PenElement extends BaseElement {
  tool: Tool.PEN;
  points: Point[];
}

// Element for Shapes
export interface ShapeElement extends BaseElement {
  tool: Tool.RECTANGLE | Tool.CIRCLE;
  backgroundColor: string;
  fillStyle: FillStyle; // Agora aceita todos os estilos
}

// Element for Text
export interface TextElement extends BaseElement {
  tool: Tool.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
}

// Element for AI-generated Images or Diagrams
export interface ImageElement extends BaseElement {
  tool: Tool.DIAGRAM;
  base64: string;
  image: HTMLImageElement;
}

// Element for Lines
export interface LineElement extends BaseElement {
  tool: Tool.LINE;
  points: [Point, Point];
}

// Element for Arrows
export interface ArrowElement extends BaseElement {
  tool: Tool.ARROW;
  points: [Point, Point];
  controlPoint?: Point; // Para curva
  startBinding?: number; // ID of element
  endBinding?: number; // ID of element
}

export type CanvasElement =
  | PenElement
  | ShapeElement
  | TextElement
  | ImageElement
  | LineElement
  | ArrowElement;

export interface ToolOptions {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  fillStyle?: FillStyle;
  roughness?: number; 
}

export interface AIState {
  instance: GoogleGenAI | null;
  isGenerating: boolean;
  error: string | null;
}

export type FillStyle =
  | "solid"
  | "hachure"
  | "zigzag"
  | "cross-hatch"
  | "dots"
  | "sunburst"
  | "dashed"
  | "zigzag-line";
