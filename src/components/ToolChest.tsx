"use client";

import { useState, useEffect, SetStateAction, Dispatch, ChangeEvent} from "react";

const shapes = ["square", "circle", "diamond", "checkmark"];

const ToolChest = ({
        iconSize,
        setIconSize,
        setDeleteTrigger,
        selectedIcons, 
        setEditInputs,
        tools,
        setTools,
    }: {
        iconSize: number;
        setIconSize: (size: number) => void;
        setDeleteTrigger: (trigger: boolean) => void;
        selectedIcons: { id: number; page: number }[];
        setEditInputs: Dispatch<SetStateAction<{ name: string; category: string }>>;
        tools: any[]; 
        setTools: Dispatch<SetStateAction<any[]>>;
    }) => {
    const [newTool, setNewTool] = useState({
        name: "",
        category: "",
        color: "#FF2400",
        shape: "square",
    });
    const [addToolVisible, setaddToolVisible] = useState(true); 
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [localEditInputs, setLocalEditInputs] = useState({ name: "", category: "" }); 

    const handleEditConfirm = () => {
        if (!localEditInputs.name && !localEditInputs.category) {
            alert("Please enter a name or category.");
            return;
        }
        setEditInputs(localEditInputs);
        setLocalEditInputs({ name: "", category: "" });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    useEffect(() => {
        if (selectedIcons.length > 0) {
            setShowEditPopup(true);
        }
        else{
            setShowEditPopup(false);
        }
    }, [selectedIcons]);

    return (
        <div style={{ flex: 0.2, backgroundColor: "#E7E7E7", width: "20%", padding: "10px", transition: "flex 0.3s ease", borderRadius: "30px",
            display: "flex",
            flexDirection: "column",
            height: 'calc(100%-20px)', 
        }}>
            <h3 style={{ fontFamily: "Arial, sans-serif", textAlign: "center", marginTop:'10px', marginBottom:'10px'}}>Tool Chest</h3>
            

            {/* Edit Popup */}
            {showEditPopup && (
                <div
                style={{
                  padding: "10px",
                  paddingLeft:"20px",
                  borderRadius: "10px",
                  backgroundColor: "#f4f4f4",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  margin: "20px auto",
                  height:"20%",
                  width:"100%"
                }}
              >
                <h4
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "15px",
                    margin: "0 0 15px 0",
                    textAlign: "center",
                  }}
                >
                  Edit/Delete Selected Icons
                </h4>
              
                {/* Input fields */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  {/* Name Field */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px", 
                    }}
                  >
                    <label
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                        minWidth: "80px",
                        fontWeight: "bold",
                        color:'#4A4A4A'
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter New Name"
                      value={localEditInputs.name}
                      onChange={(e) =>
                        setLocalEditInputs({ ...localEditInputs, name: e.target.value })
                      }
                      style={{
                        flex: 1, 
                        padding: "5px",
                        borderRadius: "20px",
                        border: "1px solid #ddd",
                        backgroundColor: "#fff",
                        fontSize: "14px",
                        paddingLeft:'10px',
                      }}
                    />
                  </div>
              
                  {/* Category Field */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                        minWidth: "80px",
                        fontWeight: "bold",
                        color:'#4A4A4A'
                      }}
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Enter New Category"
                      value={localEditInputs.category}
                      onChange={(e) =>
                        setLocalEditInputs({
                          ...localEditInputs,
                          category: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "5px",
                        borderRadius: "20px",
                        border: "1px solid #ddd",
                        backgroundColor: "#fff",
                        fontSize: "14px",
                        paddingLeft:'10px',
                      }}
                    />
                  </div>
                </div>
              
                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "8px",
                  }}
                >
                  <button
                    onClick={handleEditConfirm}
                    style={{
                      backgroundColor: "#569AFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 20px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteTrigger(true)}
                    style={{
                      backgroundColor: "#FF6F61",
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "10px 20px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
            )}

            <button
                onClick={() => setaddToolVisible(!addToolVisible)}
                style={{
                    backgroundColor: "#569AFF",
                    color: "#fff",
                    cursor: "pointer",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "20px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    width:'120px'
                }}
            >
                {addToolVisible ? "Add Tools" : "Hide Menu"}
            </button>
            {!addToolVisible && (
            <div
                style={{
                marginTop: "2px",
                padding: "10px",
                paddingLeft:'20px',
                backgroundColor: "#F0F0F0",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                height:"24%"
                }}
            >
                <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    rowGap: "5px",
                    columnGap: "15px",
                    alignItems: "center",
                }}
                >
                    {/* First Column - Labels */}
                    <label style={{ fontWeight: "bold", fontSize: "14px", fontFamily: 'Arial, sans-serif', color:'#4A4A4A'}}>Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter Tool Name"
                        value={newTool.name}
                        onChange={handleInputChange}
                        style={{
                        padding: "5px",
                        paddingLeft:'10px',
                        border: "1px solid #ccc",
                        borderRadius: "20px",
                        fontSize: "14px",
                        width:'80%'
                        }}
                    />

                    <label style={{ fontWeight: "bold", fontSize: "14px", fontFamily: 'Arial, sans-serif', color:'#4A4A4A' }}>Category</label>
                    <input
                        type="text"
                        name="category"
                        placeholder="Enter Category"
                        value={newTool.category}
                        onChange={handleInputChange}
                        style={{
                        padding: "5px",
                        paddingLeft:'10px',
                        border: "1px solid #ccc",
                        borderRadius: "20px",
                        fontSize: "14px",
                        width:'80%'
                        }}
                    />

                    <label style={{ fontWeight: "bold", fontSize: "14px", fontFamily: 'Arial, sans-serif', color:'#4A4A4A' }}>Shape</label>
                    <select
                        name="shape"
                        value={newTool.shape}
                        onChange={handleInputChange}
                        style={{
                        padding: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "20px",
                        fontSize: "14px",
                        width:'90%'
                        }}
                    >
                        {shapes.map((shape) => (
                        <option key={shape} value={shape}>
                            {shape.charAt(0).toUpperCase() + shape.slice(1)}
                        </option>
                        ))}
                    </select>

                    <label style={{ fontWeight: "bold", fontSize: "14px", fontFamily: 'Arial, sans-serif', color:'#4A4A4A' }}>Color</label>
                    <input
                        type="color"
                        name="color"
                        value={newTool.color}
                        onChange={handleInputChange}
                        style={{
                        padding: "3px",
                        border: "none",
                        height: "33px",
                        width:'90%'
                        }}
                    />
                </div>
                <div style={{ textAlign: "center" }}>
                    <button
                        onClick={handleAddTool}
                        style={{
                            marginTop: "0px",
                            padding: "8px 20px",
                            backgroundColor: "#569AFF",
                            color: "#fff",
                            border: "none",
                            borderRadius: "20px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            width: "100px",
                            textAlign: "center",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                    Add Tool
                    </button>
                </div>

            </div>
            )}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between", 
                        margin: "6px 0",
                    }}
                    >
                    {/* Left side: Title */}
                    <h4
                        style={{
                        fontFamily: "Arial, sans-serif",
                        margin: "0",
                        fontSize: "16px",
                        }}
                    >
                        Available Tools
                    </h4>

                    {/* Right side: Slider and Label */}
                    <div
                        style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "50%",
                        }}
                    >
                        <label
                        htmlFor="icon-size-slider"
                        style={{
                            fontFamily: "Arial, sans-serif",
                            fontSize: "14px",
                            marginBottom: "0px", 
                        }}
                        >
                        Icon Size: {iconSize}px
                        </label>
                        <input
                        id="icon-size-slider"
                        type="range"
                        min="10"
                        max="200"
                        value={iconSize}
                        onChange={(e) => setIconSize(Number(e.target.value))}
                        style={{
                            width: "100%", 
                            cursor: "pointer",
                            accentColor: "#569AFF", 
                        }}
                        />
                    </div>
                </div>
                <div style={{ flexGrow: 0.80, overflowY: "auto", overflowX: "hidden", marginTop: "10px" }}>

                {tools.length === 0 ? (
                    <p>No tools added yet.</p>
                ) : (
                    <div
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            tableLayout: "fixed", 
                            overflowY: "auto", 
                            border: "1px solid #ccc",
                            backgroundColor: "#f9f9f9", 
                        }}
                    >
            {/* Header Row */}
            <div
                style={{
                    display: "table-row",
                    fontWeight: "bold",
                    backgroundColor: "#eaeaea", 
                    borderBottom: "2px solid #ccc", 
                }}
            >
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "center",
                        padding: "5px 10px",
                        border: "1px solid #ccc",
                        width: "10%", 
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    Icon
                </div>
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "left",
                        padding: "5px 10px",
                        border: "1px solid #ccc",
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    Name
                </div>
                <div
                    style={{
                        display: "table-cell",
                        textAlign: "left",
                        border: "1px solid #ccc",
                        padding: "5px 10px",
                        fontFamily: 'Arial, sans-serif'
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
                            border: "1px solid #ccc",
                            fontFamily: 'Arial, sans-serif'
                        }}
                        draggable 
                        onDragStart={(e) => {
                            e.dataTransfer.setData(
                                "tool",
                                JSON.stringify({ ...tool, id: index, size: iconSize }) 
                            );
                        
                            // Create SVG element
                            const svgNamespace = "http://www.w3.org/2000/svg";
                            const svg = document.createElementNS(svgNamespace, "svg");
                            svg.setAttribute("width", "40");
                            svg.setAttribute("height", "40");
                            svg.setAttribute("xmlns", svgNamespace);
                            svg.style.position = "absolute";
                            svg.style.top = "-1000px"; 
                        
                            const shape = document.createElementNS(svgNamespace, "path");
                            shape.setAttribute(
                                "d",
                                tool.shape === "circle"
                                    ? "M20 20 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0" // Circle
                                    : tool.shape === "square"
                                    ? "M5 5 H35 V35 H5 Z" // Square
                                    : tool.shape === "diamond"
                                    ? "M20 5 L35 20 L20 35 L5 20 Z" // Diamond
                                    : "M40 12.4 L17.2 40 L1.6 25.2 L6.4 21.2 L17.2 31.2 L35.2 6.4 Z" // Checkmark
                            );
                            shape.setAttribute("fill", tool.color);
                            shape.setAttribute("opacity", "0.5");
                            svg.appendChild(shape);
                        
                            document.body.appendChild(svg); 
                            e.dataTransfer.setDragImage(svg, 20, 20);
                            setTimeout(() => document.body.removeChild(svg), 0);
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
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: tool.color,
                                    opacity: 0.5, 
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

export default ToolChest;
