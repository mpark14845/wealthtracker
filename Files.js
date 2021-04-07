const path = require('path');
const fs = require('fs');
const Excel = require('exceljs')

class Files{
    constructor(dataFile){
        this.jsonDataFile = dataFile
             
    }

    async readJSON(){
        const filename = this.jsonDataFile         
        return new Promise(function (resolve, reject) {
        try{
            fs.readFile( filename, 'utf8', function( error, data ) {
                if ( error ) {
                    console.log(error)
                    reject( error );
                } else {
                    resolve( data );
                }
            });
        }
        catch(err){
            console.log(err)
        }
        });
    }

    writeJSON(val) {
        const fileName = this.jsonDataFile;              
        try{        
            if (val != null) fs.writeFileSync(fileName, JSON.stringify(val))            
        }
        catch(err){
            console.log(err)
        }
    }

    async outputToExcel(data){
        //https://github.com/brcline/getting-started-with-exceljs/blob/master/index.js
        return new Promise(function (resolve, reject) {
            try{
            const { Assets, Debts } = data;
 
            let workbook = new Excel.Workbook()
            let worksheet = workbook.addWorksheet('Assets')
            worksheet.columns = [
                {header: 'Category', key: 'category'},
                {header: 'Item', key: 'item'},
                {header: 'Value', key: 'value'}            
            ]
            worksheet.columns.forEach(column => {
                column.width = column.header.length < 12 ? 12 : column.header.length
            })
            worksheet.getRow(1).font = {bold: true}
            
            Assets.forEach((e, index) => {
                // row 1 is the header.
                const rowIndex = index + 2
            
                // By using destructuring we can easily dump all of the data into the row without doing much
                // We can add formulas pretty easily by providing the formula property.
                worksheet.addRow({
                ...e,
                amountRemaining: {
                    formula: `=C${rowIndex}-D${rowIndex}`
                },
                percentRemaining: {
                    formula: `=E${rowIndex}/C${rowIndex}`
                }
                })
            })
            const totalNumberOfRows = worksheet.rowCount
            // Add the total Rows
            worksheet.addRow(['','Total',{formula: `=sum(C2:C${totalNumberOfRows})`}  ])
            // Set the way columns C - F are formatted
                const figureColumns = [3]
                figureColumns.forEach((i) => {
                    worksheet.getColumn(i).numFmt = '$0.00'
                    worksheet.getColumn(i).alignment = {horizontal: 'right'}
                })
            const fileName = 'NuageIT-WealthTracker.xlsx'; 
            workbook.xlsx.writeFile(fileName, 'utf8', function( error, fileName ) {
                if ( error ) {
                    console.log(error)
                    reject( error );
                } else {
                    resolve( fileName);
                }
            });
    }
    catch(err){
        console.log(err)
        }
    });
} 

}

module.exports = Files

