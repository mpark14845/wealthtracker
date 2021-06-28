const path = require("path");
const fs = require("fs");
const Excel = require("exceljs");

class Files {
  constructor(dataFile) {
    this.jsonDataFile = dataFile;
  }

  checkDefaultFile() {
    const filename = this.jsonDataFile;
    if (!fs.existsSync(filename)) {
      const defaultItems = {
        Assets: [
          { id: 5, category: "Properties", item: "Home", value: 500000 },
          { id: 4, category: "Investments", item: "Stocks", value: 100000 },
        ],
        Debts: [
          { id: 3, category: "Mortage", item: "Home", value: 250000 },
          { id: 2, category: "Loans", item: "Car Loan", value: 5000 },
        ],
      };

      const newAsset = {
        id: 1,
        category: "Asset Category",
        item: "New Asset",
        value: 0,
      };

      const newDebt = {
        id: 1,
        category: "Debt Category",
        item: "New Debt",
        value: 0,
      };

      const newObject = { Assets: "", Debts: "" };
      newObject.Assets = newAsset;
      newObject.Debts = newDebt;
      const fileName = this.jsonDataFile;
      try {
        console.log(defaultItems);
        fs.writeFileSync(fileName, JSON.stringify(defaultItems));
      } catch (err) {
        console.log(err);
      }
    }
  }

  async readJSON() {
    const filename = this.jsonDataFile;

    return new Promise(function (resolve, reject) {
      try {
        fs.readFile(filename, "utf8", function (error, data) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            resolve(data);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  writeJSON(val) {
    const fileName = this.jsonDataFile;
    try {
      if (val != null) fs.writeFileSync(fileName, JSON.stringify(val));
    } catch (err) {
      console.log(err);
    }
  }

  outputToExcel(folderName, data) {
    //https://github.com/brcline/getting-started-with-exceljs/blob/master/index.js
    //TODO:  Need to add in sheet for Debts.
    return new Promise(function (resolve, reject) {
      try {
        const { Assets, Debts } = data;

        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet("Assets");
        worksheet.columns = [
          { header: "Category", key: "category" },
          { header: "Item", key: "item" },
          { header: "Value", key: "value" },
        ];
        worksheet.columns.forEach((column) => {
          column.width = column.header.length < 12 ? 12 : column.header.length;
        });
        worksheet.getRow(1).font = { bold: true };

        Assets.forEach((e, index) => {
          // row 1 is the header.
          const rowIndex = index + 2;

          // By using destructuring we can easily dump all of the data into the row without doing much
          // We can add formulas pretty easily by providing the formula property.
          worksheet.addRow({
            ...e,
            amountRemaining: {
              formula: `=C${rowIndex}-D${rowIndex}`,
            },
            percentRemaining: {
              formula: `=E${rowIndex}/C${rowIndex}`,
            },
          });
        });
        const totalNumberOfRows = worksheet.rowCount;
        // Add the total Rows
        worksheet.addRow([
          "",
          "Total",
          { formula: `=sum(C2:C${totalNumberOfRows})` },
        ]);
        // Set the way columns C - F are formatted
        const figureColumns = [3];
        figureColumns.forEach((i) => {
          worksheet.getColumn(i).numFmt = "$0.00";
          worksheet.getColumn(i).alignment = { horizontal: "right" };
        });
        const fileName = "NuageIT-WealthTracker.xlsx";

        workbook.xlsx
          .writeFile(`${folderName}\\${fileName}`, "utf8")
          .then(function () {
            resolve(`${folderName}\\${fileName}`);
          })
          .catch(function (error) {
            reject(error);
          });
      } catch (err) {
        console.log(err);
      }
    });
  }
}

module.exports = Files;
