import {Dispatch, SetStateAction, FC} from "react";

type DroppedIcon = {
    category: string;
    color: string;
    id: number;
    name: string;
    page: number; 
    shape: string;
    size: number;
    x: number;
    y: number;
};


interface InventoryListProps {
    droppedIcons: DroppedIcon[]; 
    setDroppedIcons: Dispatch<SetStateAction<DroppedIcon[]>>; 
}

const InventoryList: FC<InventoryListProps> = ({ droppedIcons, setDroppedIcons }) => {
    // Group icons by name and category
    const groupedIcons = droppedIcons.reduce((acc: Record<string, { count: number; category: string; shape: string; color: string }>, icon) => {
        const key = `${icon.name}-${icon.category}`;
        if (!acc[key]) {
            acc[key] = { count: 0, category: icon.category, shape: icon.shape, color: icon.color };
        }
        acc[key].count += 1;
        return acc;
    }, {});

    // Convert grouped data to an array for rendering and sort by category
    const inventory = Object.entries(groupedIcons)
        .map(([key, value]) => {
            const [name] = key.split("-");
            return { name, count: value.count, category: value.category, shape: value.shape, color: value.color };
        })
        .sort((a, b) => a.category.localeCompare(b.category)); // Sort by category alphabetically

    // Function to remove all items of a specific name and category
    const handleRemoveItem = (name: string, category: string) => {
        setDroppedIcons((prev) =>
            prev.filter((icon) => !(icon.name === name && icon.category === category))
        );
    };

    return (
        <div
            style={{
                flex: 0.4,
                backgroundColor: "#F1F1F1",
                overflow: "auto",
                padding: "10px",
                boxSizing: "border-box",
                transition: "flex 0.3s ease",
                height: "100%",
                width: "100%",
            }}
        >
            <h3 style={{ margin: "0 0 10px 0", textAlign: "center", fontFamily: 'Arial, sans-serif'}}>Inventory List</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: 'Arial, sans-serif' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: "2px solid #444", padding: "5px" }}>Icon</th>
                        <th style={{ borderBottom: "2px solid #444", padding: "5px" }}>Name</th>
                        <th style={{ borderBottom: "2px solid #444", padding: "5px" }}>Category</th>
                        <th style={{ borderBottom: "2px solid #444", padding: "5px" }}>Count</th>
                        <th style={{ borderBottom: "2px solid #444", padding: "5px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.length > 0 ? (
                        inventory.map((item, index) => (
                            <tr key={`${item.name}-${item.category}-${index}`}>
                                <td style={{ padding: "5px", borderBottom: "1px solid #ddd"}}>
                                    <div
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: item.color,
                                            opacity: 0.5,
                                            clipPath: getClipPath(item.shape), 
                                        }}
                                    />
                                </td>
                                <td style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                                    {item.name}
                                </td>
                                <td style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                                    {item.category}
                                </td>
                                <td style={{ padding: "5px", borderBottom: "1px solid #ddd"}}>
                                    {item.count}
                                </td>
                                <td style={{ padding: "5px", borderBottom: "1px solid #ddd"}}>
                                    <button
                                        onClick={() => handleRemoveItem(item.name, item.category)}
                                        style={{
                                            backgroundColor: "#FF6F61",
                                            color: "#fff",
                                            border: "none",
                                            padding: "5px 10px",
                                            cursor: "pointer",
                                            borderRadius: "20px",

                                        }}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "10px", color: "#777" }}>
                                No items in inventory
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
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

export default InventoryList;
