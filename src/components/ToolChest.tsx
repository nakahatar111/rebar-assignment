"use client";

import React, { useState } from "react";

const shapes = ["square", "circle", "diamond", "checkmark"];

const ToolChest = () => {
    const [tools, setTools] = useState<any[]>([]); // Stores the list of tools
    const [newTool, setNewTool] = useState({
        name: "",
        category: "",
        color: "#FF2400",
        shape: "square", // Default shape
    });
    const [addToolVisible, setaddToolVisible] = useState(true); // Track Tool Chest visibility

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTool((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTool = () => {
        if (!newTool.name || !newTool.category) {
            alert("Name and Category are required.");
            return;
        }

        setTools((prev) => [...prev, newTool]);
        setNewTool((prev) => ({
            ...prev,
            name: "",
            category: "",
        }));    
    };

    return (
        <div style={{ flex: 0.2, backgroundColor: "#f0f0f0", width: "20%", padding: "10px", border: "1px solid gray", height:'calc(100%-20px)' }}>
            <h3>Tool Chest</h3>
            <button
                onClick={() => setaddToolVisible(!addToolVisible)}
                style={{ backgroundColor: "#007bff",color: "#fff",cursor: "pointer"}} >
                {addToolVisible ? "Add Tools" : "Hide Menu"}
            </button>
            {!addToolVisible && (
                <div style={{ marginBottom: "10px", border: "green solid 2px", padding: "10px", height:"130px"}}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "40% 55%", // Set the widths for the columns
                            rowGap: "5px",
                            columnGap: "10px",
                        }}
                    >
                        {/* First Column - Labels */}
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Tool Name"
                            value={newTool.name}
                            onChange={handleInputChange}
                        />

                        <label>Category:</label>
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={newTool.category}
                            onChange={handleInputChange}
                        />

                        <label>Color:</label>
                        <input
                            type="color"
                            name="color"
                            value={newTool.color}
                            onChange={handleInputChange}
                            style={{ width: "100%", height: "100%", padding: "0", margin: "0" }}
                        />

                        <label>Shape:</label>
                        <select
                            name="shape"
                            value={newTool.shape}
                            onChange={handleInputChange}
                            style={{ width: "100%" }}
                        >
                            {shapes.map((shape) => (
                                <option key={shape} value={shape}>
                                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAddTool}
                        style={{
                            marginTop: "10px",
                            padding: "5px 10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Add Tool
                    </button>
                </div>
            )}


<div>
    <h4>Available Tools</h4>
    {tools.length === 0 ? (
        <p>No tools added yet.</p>
    ) : (
        <div
            style={{
                borderCollapse: "collapse", // Ensures borders collapse like in a traditional table
                width: "100%", // Full width
                height: addToolVisible
                    ? "calc(100% - 200px - 20px)" // Shrink height if "Add Tool" is visible
                    : "calc(100% - 50px - 20px)", // Default height when "Add Tool" is hidden
                overflowY: "auto", // Enable vertical scrolling
                border: "1px solid #ccc", // Table border
                backgroundColor: "#f9f9f9", // Light background
            }}
        >
            {/* Header Row */}
            <div
                style={{
                    display: "table-row",
                    fontWeight: "bold",
                    backgroundColor: "#eaeaea", // Light gray header background
                    borderBottom: "2px solid #ccc", // Bottom border for the header
                }}
            >
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRight: "1px solid #ccc",
                    }}
                >
                    Icon
                </div>
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "left",
                        padding: "5px 10px",
                        borderRight: "1px solid #ccc",
                    }}
                >
                    Name
                </div>
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "left",
                        padding: "5px 10px",
                    }}
                >
                    Category
                </div>
            </div>

            {/* Tool Rows */}
            {tools
                .sort((a, b) => a.category.localeCompare(b.category)) // Sort tools alphabetically by category
                .map((tool, index) => (
                    <div
                        key={index}
                        style={{
                            display: "table-row",
                            border: "1px solid #ccc", // Row borders
                        }}
                    >
                        <div
                            style={{
                                display: "table-cell",
                                textAlign: "center",
                                padding: "5px 10px",
                                borderRight: "1px solid #ccc",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: tool.color,
                                    opacity: 0.5, // See-through effect
                                    clipPath: getClipPath(tool.shape),
                                }}
                            ></span>
                        </div>
                        <div
                            style={{
                                display: "table-cell",
                                textAlign: "left",
                                padding: "5px 10px",
                                borderRight: "1px solid #ccc",
                            }}
                        >
                            {tool.name}
                        </div>
                        <div
                            style={{
                                display: "table-cell",
                                textAlign: "left",
                                padding: "5px 10px",
                            }}
                        >
                            {tool.category}
                        </div>
                    </div>
                ))}
        </div>
    )}
</div>


        </div>
    );
};

// Function to return CSS clip-paths for predefined shapes
const getClipPath = (shape: string): string => {
    switch (shape) {
        case "circle":
            return "circle(50% at 50% 50%)";
        case "square":
            return "none"; // Default square
        case "diamond":
            return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
        case "checkmark":
            return "polygon(100% 31%, 43% 100%, 4% 63%, 16% 53%, 43% 78%, 88% 22%)";
        default:
            return "none";
    }
};

export default ToolChest;
