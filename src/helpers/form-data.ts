// Convert Json to Excel
export function jsonToExcelBuffer(data: any[]): Buffer {
    const xlsx = require("xlsx");
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
}
