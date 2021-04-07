/*--------------------------------------------------------
Look and feel scripts functions
----------------------------------------------------------*/

export default class UI{
    constructor(){}


}

export function openNav() {
    document.getElementById("flyoutOrg").style.width = "400px";
    document.getElementById("main").style.marginLeft = "400px";
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
export function closeNav() {
    document.getElementById("flyoutOrg").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    let str = '    this has 4'
    console.log(str.search(/\S/))
} 
