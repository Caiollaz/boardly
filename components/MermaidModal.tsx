
import React, { useState, useEffect, useRef } from 'react';

interface MermaidModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (svgDataUrl: string) => void;
}

const defaultMermaidCode = `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
`;

const MermaidModal: React.FC<MermaidModalProps> = ({ isOpen, onClose, onInsert }) => {
    const [code, setCode] = useState(defaultMermaidCode);
    const [previewContent, setPreviewContent] = useState('');
    const [error, setError] = useState('');
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const renderDiagram = async () => {
            setError('');
            // @ts-ignore
            if (!window.mermaid || !previewRef.current) return;

            try {
                // @ts-ignore
                const { svg } = await window.mermaid.render('mermaid-preview', code);
                setPreviewContent(svg);
            } catch (e: any) {
                setError(e.message || 'Invalid Mermaid Syntax');
                setPreviewContent('');
            }
        };

        const timer = setTimeout(renderDiagram, 300);
        return () => clearTimeout(timer);

    }, [code, isOpen]);

    if (!isOpen) return null;

    const handleInsert = () => {
        if (previewContent) {
            const svgBlob = new Blob([previewContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            onInsert(url);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] border border-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-100">Text to diagram</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                 <p className="text-sm text-gray-400 mb-4">
                    Currently only <strong className="text-gray-300">Flowchart, Sequence,</strong> and <strong className="text-gray-300">Class</strong> Diagrams are supported. The other types will be rendered as image in Excalidraw.
                </p>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                    {/* Mermaid Syntax Area */}
                    <div className="flex flex-col h-full">
                         <label className="text-sm font-semibold text-gray-300 mb-2">Mermaid Syntax</label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter Mermaid syntax here..."
                            className="w-full flex-grow p-3 bg-[#121212] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition font-mono text-sm resize-none"
                        />
                    </div>
                    {/* Preview Area */}
                    <div className="flex flex-col h-full">
                         <label className="text-sm font-semibold text-gray-300 mb-2">Preview</label>
                        <div ref={previewRef} className="w-full flex-grow p-3 bg-[#121212] rounded-lg border border-gray-600 flex items-center justify-center overflow-auto">
                            {error && <div className="text-red-400 p-4 whitespace-pre-wrap">{error}</div>}
                            {!error && <div dangerouslySetInnerHTML={{ __html: previewContent }} />}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button onClick={handleInsert} disabled={!previewContent || !!error} className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MermaidModal;
