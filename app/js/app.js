const path = require("path");
const { ipcRenderer } = require("electron");

//Object & Class Definitions
class lineItemObject {
  constructor(row) {
    this.ID = row.id;
    this.Category = row.category;
    this.Item = row.item;
    this.Value = row.value;
  }
}

let assetCollection = Object();
let debtCollection = Object();
let assetSummaryCollection = Object();
let debtSummaryCollection = Object();

let totalAssets = 0;
let totalDebts = 0;
let maxRows = 0;
let maxAssetRows = 0;
let maxDebtRows = 0;
let selected_index = -1;

//Electron Render Responses//

ipcRenderer.on("sendJSON", (e, data) => {
  //let assetTotal = 0
  data = JSON.parse(data);
  const { Assets, Debts } = data;
  assetCollection = Assets.sort((a, b) =>
    a.category.toLowerCase().localeCompare(b.category.toLowerCase())
  );
  debtCollection = Debts.sort((a, b) =>
    a.category.toLowerCase().localeCompare(b.category.toLowerCase())
  );

  totalAssets = Assets.reduce((total, item) => {
    return item.value + total;
  }, 0);

  totalDebts = Debts.reduce((total, item) => {
    return item.value + total;
  }, 0);

  totalWealth = totalAssets - totalDebts;

  $("#netWorthTotal").html(formatter.format(totalWealth));
  $("#assetTotal").html(formatter.format(totalAssets));
  $("#debtTotal").html(formatter.format(totalDebts));

  renderTotalWealthPieChart(totalAssets, totalDebts);

  assetSummaryCollection = ObjectGroupBy(Assets, "category", "value");
  assetSummaryCollection = assetSummaryCollection.sort((a, b) =>
    a.Total > b.Total ? -1 : 1
  );

  debtSummaryCollection = ObjectGroupBy(Debts, "category", "value");
  debtSummaryCollection = debtSummaryCollection.sort((a, b) =>
    a.Total > b.Total ? -1 : 1
  );

  maxAssetRows = assetSummaryCollection.length;
  maxDebtRows = debtSummaryCollection.length;
  maxRows = maxAssetRows;
  if (maxDebtRows > maxRows) maxRows = maxDebtRows;

  writeCards(
    $("#assetTable"),
    maxAssetRows,
    assetSummaryCollection,
    totalAssets
  );
  writeCards($("#debtTable"), maxDebtRows, debtSummaryCollection, totalDebts);
});

ipcRenderer.on("folderName", (e, folderName) => {
  $("#exportFolder").val(folderName);
});

ipcRenderer.on("sendOutPutToExcel", (e, success, fileName) => {
  if (success) {
    alert(`${fileName} was created`);
    console.log(fileName);
  } else {
    alert(`There was an error: ${fileName}`);
    console.log(fileName);
  }
});

//Shared Function

function ObjectGroupBy(Obj, groupName, sumName) {
  var groupObj = [];
  Obj.reduce(function (res, group) {
    if (!res[group[groupName]]) {
      res[group[groupName]] = { Category: group[groupName], Total: 0 };
      groupObj.push(res[group[groupName]]);
    }
    res[group[groupName]].Total += group[sumName];
    return res;
  }, {});

  return groupObj;
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

//Manage Windows//
function writeCards(DivHolder, cardRows, Obj, objTotal) {
  const neededRows = maxRows - cardRows;
  console.log(DivHolder, cardRows, neededRows);
  let str = "";
  DivHolder.empty();

  for (let ID in Obj) {
    str = `<div class="detailrow"><div class="detailcolumn detailheader">${
      Obj[ID].Category
    }</div> 
        <div class="detailcolumn detailvalue">${formatter.format(
          Obj[ID].Total
        )}</div></div>`;
    DivHolder.append(str);
  }
  for (i = 0; i < neededRows; i++) {
    str = `<div class="totalrow"><div class="detailcolumn detailheader">&nbsp;</div> 
    <div class="detailcolumn detailvalue"></div></div>`;
    DivHolder.append(str);
  }
  str = `<div class="totalrow"><div class="detailcolumn totalheader"></div> 
      <div class="detailcolumn totalvalue">${formatter.format(
        objTotal
      )}</div></div>`;
  DivHolder.append(str);
}

function writeDetailRows(DivHolder, Obj, type) {
  try {
    $(`#${DivHolder} tbody tr`).remove();
  } catch {}

  const Rows = Object.keys(Obj).length;

  if (Rows == 0) {
    const template = document.getElementById("templateWarningBox");
    const container = document.getElementById("assetWarningBlock");

    const cloneInstance = template.content.cloneNode(true);
    let divText = cloneInstance.querySelectorAll("p");
    divText[0].textContent = `There are no ${type}s added yet.  Please click the Add button to add an ${type}.`;
    container.appendChild(cloneInstance);
  }

  for (let ID in Obj) {
    let str = `<tr>    
    <td>${Obj[ID].category}</td>    
    <td><a href="#" onclick="EditItem(${ID}, '${type}')" >${
      Obj[ID].item
    }</a></td>
    <td align='center'><div id='${type}Value${ID}' class="cell detailvalue" contenteditable="true" onkeypress="trapKeys(this)" onfocus="removeFormat(this)" onblur="updateItem(this, ${ID}, '${type}')">
    ${formatter.format(Obj[ID].value)}
    </div></td>    
    </tr>`;
    $(`#${DivHolder}`).append(str);
  }
}

function manageAssets() {
  $(".navItemLI").removeClass("active");
  $("#navAssets").addClass("active");
  $(".window").hide();
  //writeDetailAssetRows();
  writeDetailRows("assetDetailTable", assetCollection, "Asset");
  $("#assetWindow").show();
}

function manageDebts() {
  $(".navItemLI").removeClass("active");
  $("#navDebts").addClass("active");
  $(".window").hide();
  writeDetailRows("debtDetailTable", debtCollection, "Debt");
  $("#debtWindow").show();
}

function manageSettings() {
  $(".navItemLI").removeClass("active");
  $("#navSettings").addClass("active");
  $(".window").hide();
  $("#settingsWindow").show();
}

function manageAbout() {
  $(".navItemLI").removeClass("active");
  $("#navAbout").addClass("active");
  $(".window").hide();
  $("#aboutWindow").show();
}

function manageHelp() {
  $(".navItemLI").removeClass("active");
  $(".window").hide();
  $("#helpWindow").show();
}

function closeWindow() {
  $(".navItemLI").removeClass("active");
  $("#navHome").addClass("active");
  $(".window").hide();
  $("#mainWindow").show();
  ipcRenderer.send("readJSON");
}

function exit() {
  ipcRenderer.send("exitApp", "");
}

function trapKeys(el) {
  if (event.keyCode === 13) {
    event.returnValue = false;
    el.onblur();
  }
}

function removeFormat(el) {
  let textValue = el.innerHTML;
  let temp = textValue.replace(/[^0-9.-]+/g, "");
  let convertedVal = parseFloat(temp);
  el.innerHTML = convertedVal;
  selectDivText(el);
}

function selectDivText(el) {
  //Select all text in the DIV
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

//End Manage Windows//

function EditItem(recID, type) {
  let obj;
  if (type == "Asset") {
    obj = assetCollection;
  } else {
    obj = debtCollection;
  }
  selected_index = recID;
  setCategoryList(obj);
  $("#itemType").val(type.toLowerCase());
  $("#linkCategory").val(obj[recID].category);
  $("#linkItem").val(obj[recID].item);
  $("#linkValue").val(obj[recID].value);
  $("#btnDeleteContent").show();
  $("#editModal").modal("show");
}

function updateItem(el, rowID, type) {
  let obj;
  if (type == "Asset") {
    obj = assetCollection;
  } else {
    obj = debtCollection;
  }

  let textValue = $(`#${type}Value` + rowID).html();
  let temp = textValue.replace(/[^0-9.-]+/g, "");
  let convertedVal = parseFloat(temp);
  obj[rowID].value = convertedVal;
  $(`#${type}Value` + rowID).html(formatter.format(convertedVal));
  saveDataFile();
}

function addItem(obj, type) {
  selected_index = -1;
  if (type == "Asset") {
    setCategoryList(assetSummaryCollection);
  } else {
    setCategoryList(debtSummaryCollection);
  }

  $("#itemType").val(type.toLowerCase());
  $("#linkCategory").val("");
  $("#linkItem").val("");
  $("#linkValue").val("");
  $("#btnDeleteContent").hide();
  $("#editModal").modal("show");
}

function SaveRecord() {
  const itemType = $("#itemType").val();
  const category = $("#linkCategory").val();
  const item = $("#linkItem").val();
  const textVal = $("#linkValue").val();
  let value = 0;

  try {
    value = parseFloat(textVal);
  } catch {
    value = 0;
  }

  const newID = Date.now();

  if (selected_index === -1) {
    //insert
    switch (itemType) {
      case "asset":
        const newAsset = {
          id: newID,
          category: category,
          item: item,
          value: value,
        };
        assetCollection.push(newAsset);
        break;
      case "debt":
        const newDebt = {
          id: newID,
          category: category,
          item: item,
          value: value,
        };
        debtCollection.push(newDebt);
        break;
    }
    notifyUser("add");
    saveDataFile();
  } else {
    //update
    switch (itemType) {
      case "asset":
        assetCollection[selected_index].category = category;
        assetCollection[selected_index].item = item;
        assetCollection[selected_index].value = value;
        break;
      case "debt":
        debtCollection[selected_index].category = category;
        debtCollection[selected_index].item = item;
        debtCollection[selected_index].value = value;
        break;
    }
    notifyUser("edit");
    saveDataFile();
  }
  selected_index = -1;
  $("#editModal").modal("hide");
}

function DeleteRecord() {
  let recID = 0;
  let itemType = $("#itemType").val();

  switch (itemType) {
    case "asset":
      const pruneAsset = assetCollection.splice(selected_index, 1);
      writeDetailRows("assetDetailTable", assetCollection, "Asset");
      break;
    case "debt":
      const pruneDebt = debtCollection.splice(selected_index, 1);
      writeDetailRows("debtDetailTable", debtCollection, "Debt");
      break;
  }
  saveDataFile();
  selected_index = -1;
  $("#linkCategory").val("");
  $("#linkItem").val("");
  $("#linkValue").val("");
  notifyUser("delete");
  $("#editModal").modal("hide");
  writeDetailRows("assetDetailTable", assetCollection, "Asset");
  writeDetailRows("debtDetailTable", debtCollection, "Debt");
}

function saveDataFile() {
  const newObject = { Assets: "", Debts: "" };
  newObject.Assets = assetCollection;
  newObject.Debts = debtCollection;
  ipcRenderer.send("saveDataFile", newObject);
  writeDetailRows("assetDetailTable", assetCollection, "Asset");
  writeDetailRows("debtDetailTable", debtCollection, "Debt");
}

function selectExportFolder() {
  ipcRenderer.send("openExportDialog", "folderExport");
}

function outputToExcel() {
  const newObject = { Assets: "", Debts: "" };
  const folderExport = $("#exportFolder").val();
  if (folderExport == "") {
    alert("You must select a folder to output the file to.");
  } else {
    newObject.Assets = assetCollection;
    newObject.Debts = debtCollection;
    ipcRenderer.send("outputToExcel", folderExport, newObject);
  }
}

function notifyUser(action) {
  let msg = "";
  switch (action) {
    case "add":
      msg = "Your new item has been added";
      break;
    case "edit":
      msg = "Your line item has been changed";
      break;
    case "delete":
      msg = "Your line item has been deleted";
      break;
    case "export":
      msg = "Your data has been exported";
      break;
    case "import":
      msg = "Import Complete";
      break;
  }
  var notify = new Notification("Wealth Manager", {
    body: msg,
    icon: path.join(__dirname, "img", "icon.png"),
  });
  $("#footerAlert").html(msg);
  setTimeout(() => $("#footerAlert").empty(), 5000);
}

function setCategoryList(ItemObject) {
  $("#categoryList").empty();
  let options = "";

  ItemObject.forEach((obj) => {
    options += '<option value="' + obj.Category + '" />';
  });
  $("#categoryList").append(options);
}
