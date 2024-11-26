import React, { useState } from "react";

const DraggableIconsLayer = ({
    zoomLevel,
    currentPage,
    containerRef,
}: {
    zoomLevel: number;
    currentPage: number;
    containerRef: React.RefObject<HTMLDivElement>;
}) => {
    const [droppedIcons, setDroppedIcons] = useState<any[]>([]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const toolData = JSON.parse(e.dataTransfer.getData("tool"));

        const x = (e.clientX - rect.left + 6) / zoomLevel;
        const y = (e.clientY - rect.top + 6) / zoomLevel;

        setDroppedIcons((prev) => [
            ...prev,
            { ...toolData, x, y, page: currentPage },
        ]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleResize = (index: number, newSize: number) => {
        setDroppedIcons((prev) =>
            prev.map((icon, i) =>
                i === index ? { ...icon, size: newSize } : icon
            )
        );
    };

    const handleRearrange = (index: number, newX: number, newY: number) => {
        setDroppedIcons((prev) =>
            prev.map((icon, i) =>
                i === index ? { ...icon, x: newX, y: newY } : icon
            )
        );
    };

    return (
        <div
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {droppedIcons
                .filter((icon) => icon.page === currentPage)
                .map((icon, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: icon.x * zoomLevel,
                            top: icon.y * zoomLevel,
                            width: 20 * zoomLevel,
                            height: 20 * zoomLevel,
                            backgroundColor: icon.color,
                            opacity: 0.5,
                            clipPath: getClipPath(icon.shape),
                            transform: `translate(-50%, -50%)`, // Center the icon at the drop point
                            cursor: "pointer",
                        }}
                        title={`${icon.name} (${icon.category})`} // Tooltip
                        draggable
                        onDragEnd={(e) =>
                            handleRearrange(
                                index,
                                (e.clientX - containerRef.current!.getBoundingClientRect().left) /
                                    zoomLevel,
                                (e.clientY - containerRef.current!.getBoundingClientRect().top) /
                                    zoomLevel
                            )
                        }
                    ></div>
                ))}
        </div>
    );
};

const getClipPath = (shape: string): string => {
    switch (shape) {
        case "circle":
            return "circle(50% at 50% 50%)";
        case "square":
            return "none";
        case "diamond":
            return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
        case "checkmark":
            return "polygon(100% 31%, 43% 100%, 4% 63%, 16% 53%, 43% 78%, 88% 22%)";
        default:
            return "none";
    }
};

export default DraggableIconsLayer;
